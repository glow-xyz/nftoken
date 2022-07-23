use crate::account_types::*;
use anchor_lang::prelude::*;
use crate::errors::*;

/// # Burn NFT
///
/// Burning an NFT closes the account and returns the SOL to the current holder.
pub fn nft_burn_inner(ctx: Context<NftBurn>) -> Result<()> {
    require!(!ctx.accounts.nft.is_frozen, NftokenError::Unauthorized);

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct NftBurn<'info> {
    #[account(mut, has_one = holder, close = holder)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,
}
