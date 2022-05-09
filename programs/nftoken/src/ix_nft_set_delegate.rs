use anchor_lang::prelude::*;

use crate::account_types::*;
use crate::errors::*;

/// ## Delegate an NFT
///
/// This is useful for marketplaces and escrow programs. The NFT will still show up in
/// the *owner*'s wallet but the *delegate* can transfer the NFT once.
///
/// This requires the *owner* to trust the *delegate* because the *delegate* could transfer
/// the NFT to themselves and take control.
pub fn nft_set_delegate_inner(ctx: Context<NftSetDelegate>) -> Result<()> {
    let holder = &ctx.accounts.holder;
    let nft = &mut ctx.accounts.nft;

    let action_allowed = nft.holder.key() == holder.key();
    require!(action_allowed, NftokenError::Unauthorized);

    let delegate = ctx.accounts.delegate.key();
    nft.delegate = delegate;

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct NftSetDelegate<'info> {
    #[account(mut, has_one = holder)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,

    // TODO: do we need to check that that the delegate
    /// CHECK: the delegate can be any account type
    pub delegate: AccountInfo<'info>,
}
