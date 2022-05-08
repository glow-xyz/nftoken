use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Mint NFT
///
/// This lets you mint an NFT from a mintlist.
pub fn mintlist_mint_nft_inner(ctx: Context<MintlistMintNft>) -> Result<()> {
    let mintlist = &mut ctx.accounts.mintlist;
    let current_time = ctx.accounts.clock.unix_timestamp;

    require!(
        mintlist.is_mintable(current_time),
        NftokenError::Unauthorized
    );

    // Get information about the NFT we are going to mint
    // TODO: support random generation mode

    let mint_info_size = MintInfo::size();
    let mint_info_pos = MintlistAccount::size(mintlist.num_nfts_redeemed);

    mintlist.num_nfts_redeemed += 1; // TODO: do checked addition

    let mintlist_account_info = mintlist.to_account_info();
    let mintlist_data = mintlist_account_info.data.borrow_mut();
    let mint_info_data = &mut &mintlist_data[mint_info_pos..(mint_info_pos + mint_info_size)];

    let mut mint_info: MintInfo = AnchorDeserialize::deserialize(mint_info_data)?;
    mint_info.minted = true;

    let nft = &mut ctx.accounts.nft;
    nft.collection = mintlist.collection;
    nft.version = 1;
    nft.holder = mintlist.creator;
    nft.creator = ctx.accounts.signer.key();
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

    #[account(mut)]
    pub mintlist: Account<'info, MintlistAccount>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}
