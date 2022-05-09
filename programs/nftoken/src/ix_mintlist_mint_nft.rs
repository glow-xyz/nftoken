use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_lang::solana_program::system_instruction;
use std::convert::TryInto;

/// # Mint NFT
///
/// This lets you mint an NFT from a mintlist.
pub fn mintlist_mint_nft_inner(ctx: Context<MintlistMintNft>) -> Result<()> {
    let mintlist = &mut ctx.accounts.mintlist;
    let current_time = ctx.accounts.clock.unix_timestamp;
    let signer = &ctx.accounts.signer;
    let treasury = &ctx.accounts.treasury_sol;

    // TODO: take some money here to punish bots?

    // Require that the mintlist is configured and ready for minting.
    require!(
        mintlist.is_mintable(current_time),
        NftokenError::Unauthorized
    );

    // Pay for the NFT by transferring SOL from the signer / minter → the treasury.
    // We check that the `treasury.key == mintlist.treasury_sol`.
    let ix = system_instruction::transfer(&signer.key(), &treasury.key(), mintlist.price);
    solana_program::program::invoke(&ix, &[signer.to_account_info().clone(), treasury.clone()])?;

    let mintlist_account_info = mintlist.to_account_info();
    let mut mintlist_data = mintlist_account_info.data.borrow_mut();

    // Find the `mint_info` for the NFT we are going to mint
    let mint_info_index = get_mint_info_index(&*mintlist);
    let mint_info_pos = MintlistAccount::size(mint_info_index.try_into().unwrap());

    // We make sure that we haven't minted this yet.
    require!(
        mintlist_data[mint_info_pos] == 0,
        NftokenError::Unauthorized
    );

    // The first byte of the `mint_info` is `minted`, so this sets minted = true
    mintlist_data[mint_info_pos] = 1;

    let mint_info_size = MintInfo::size();
    let mint_info_data = &mut &mintlist_data[mint_info_pos..(mint_info_pos + mint_info_size)];
    let mint_info: MintInfo = AnchorDeserialize::deserialize(mint_info_data)?;

    // Configure the minted NFT
    let nft = &mut ctx.accounts.nft;
    nft.version = 1;
    nft.collection = mintlist.collection;
    nft.creator = mintlist.creator;
    nft.holder = ctx.accounts.signer.key();
    nft.metadata_url = mint_info.metadata_url;
    nft.creator_can_update = true;

    mintlist.num_nfts_redeemed = mintlist.num_nfts_redeemed.checked_add(1).unwrap();

    Ok(())
}

fn get_mint_info_index(mintlist: &Account<MintlistAccount>) -> usize {
    // TODO: support random generation mode
    return mintlist.num_nfts_redeemed.try_into().unwrap();
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
