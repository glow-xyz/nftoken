use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Undelegate an NFT
///
/// This removes the `nft.delegate` so the authority has the sole authority to transfer the NFT.
///
/// ## Auth
///
/// The `nft.holder` or the current `nft.delegate` must sign the transaction.
pub fn nft_unset_delegate_inner(ctx: Context<NftUnsetDelegate>) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let nft = &mut ctx.accounts.nft;

    let current_delegate = &nft.delegate;

    let is_holder = nft.holder.key() == signer.key();
    let is_delegate =
        current_delegate.key() != NULL_PUBKEY && current_delegate.key() == signer.key();
    let action_allowed = is_holder || is_delegate;

    require!(action_allowed, NftokenError::DelegateUnauthorized);

    nft.delegate = NULL_PUBKEY;

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct NftUnsetDelegate<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
}
