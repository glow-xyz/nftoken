use anchor_lang::prelude::*;
use crate::account_types::NftAccount;
use crate::errors::NftokenError;

///  # Update NFT
///
/// Update the nft information on chain.
pub fn nft_update_inner(
    ctx: Context<NftUpdate>,
    name: [u8; 32],
    image_url: [u8; 64],
    metadata_url: [u8; 64],
    creator_can_update: bool
) -> Result<()> {
    let nft_account = &mut ctx.accounts.nft;

    let action_allowed = nft_account.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(nft_account.creator_can_update, NftokenError::Unauthorized);

    nft_account.name = name;
    nft_account.image_url = image_url;
    nft_account.metadata_url = metadata_url;
    nft_account.creator_can_update = creator_can_update;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 64], metadata_url: [u8; 64])]
pub struct NftUpdate<'info> {
    #[account(mut, has_one = creator)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}
