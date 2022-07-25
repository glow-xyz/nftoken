use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Transfer NFT
///
/// Transfer an NFT to a different owner
///
/// Either the *owner* or the *delegate* can take this action.
pub fn nft_transfer_inner(ctx: Context<NftTransfer>) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let nft = &mut ctx.accounts.nft;

    require!(!nft.is_frozen, NftokenError::Unauthorized);

    let delegate = nft.delegate;

    let is_holder = nft.holder.key() == signer.key();
    let is_delegate = delegate.key() != NULL_PUBKEY && delegate.key() == signer.key();
    let transfer_allowed = is_holder || is_delegate;

    let recipient = ctx.accounts.recipient.key();

    require!(recipient != NULL_PUBKEY, NftokenError::Unauthorized);
    require!(transfer_allowed, NftokenError::Unauthorized);

    nft.holder = recipient;
    nft.delegate = NULL_PUBKEY;

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct NftTransfer<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,

    pub signer: Signer<'info>,

    /// CHECK: this can be any type
    pub recipient: AccountInfo<'info>,
}
