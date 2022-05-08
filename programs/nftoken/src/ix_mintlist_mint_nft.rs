use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_lang::solana_program::system_instruction;

/// # Mint NFT
///
/// This lets you mint an NFT from a mintlist.
pub fn mintlist_mint_nft_inner(ctx: Context<MintlistMintNft>) -> Result<()> {
    let mintlist = &mut ctx.accounts.mintlist;
    let current_time = ctx.accounts.clock.unix_timestamp;
    let signer = &ctx.accounts.signer;
    let treasury = &ctx.accounts.treasury_sol;

    // Require that the mintlist is configured and ready for minting.
    require!(
        mintlist.is_mintable(current_time),
        NftokenError::Unauthorized
    );

    // Pay for the NFT by transferring SOL from the signer / minter → the treasury.
    // We check that the `treasury.key == mintlist.treasury_sol`.
    let ix = system_instruction::transfer(&signer.key(), &treasury.key(), mintlist.price);
    solana_program::program::invoke(&ix, &[signer.to_account_info().clone(), treasury.clone()])?;

    // Find the `mint_info` for the NFT we are going to mint
    // TODO: support random generation mode
    let mint_info_size = MintInfo::size();
    let mint_info_pos = MintlistAccount::size(mintlist.num_nfts_redeemed);
    mintlist.num_nfts_redeemed += 1; // TODO: do checked addition
    let mintlist_account_info = mintlist.to_account_info();
    let mut mintlist_data = mintlist_account_info.data.borrow_mut();

    // We make sure that we haven't minted this yet.
    require!(
        mintlist_data[mint_info_pos] == 0,
        NftokenError::Unauthorized
    );
    // The first byte of the `mint_info` is `minted`, so this sets minted = true
    mintlist_data[mint_info_pos] = 1;
    let mint_info_data = &mut &mintlist_data[mint_info_pos..(mint_info_pos + mint_info_size)];
    let mint_info: MintInfo = AnchorDeserialize::deserialize(mint_info_data)?;

    // Configure the minted NFT!
    let nft = &mut ctx.accounts.nft;
    nft.version = 1;
    nft.collection = mintlist.collection;
    nft.creator = mintlist.creator;
    nft.holder = ctx.accounts.signer.key();
    nft.name = mint_info.name;
    nft.image_url = mint_info.image_url;
    nft.metadata_url = mint_info.metadata_url;
    nft.created_at = ctx.accounts.clock.unix_timestamp;
    nft.creator_can_update = true;

    Ok(())
}

#[derive(Accounts)]
pub struct MintlistMintNft<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = NFT_ACCOUNT_SIZE)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut, has_one = treasury_sol)]
    pub mintlist: Account<'info, MintlistAccount>,

    // TODO: make sure that we are checking the account address properly
    /// CHECK: we don't care what type this is, but we need to make sure that it matches `mintlist.treasury_sol`
    #[account(mut)]
    pub treasury_sol: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}
