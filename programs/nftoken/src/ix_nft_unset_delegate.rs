use anchor_lang::prelude::*;
use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;

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
    let action_allowed =
        // The NFT holder can remove the delegate
        nft.holder.key() == signer.key()
            // The delegate can also remove the delegate
            || current_delegate.key() == signer.key();

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


