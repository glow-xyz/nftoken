use anchor_lang::prelude::*;
use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;

/// Delegate an NFT
///
/// This is useful for marketplaces and escrow programs. The NFT will still show up in
/// the *owner*'s wallet but the *delegate* can transfer the NFT once.
///
/// This requires the *owner* to trust the *delegate* because the *delegate* could transfer
/// the NFT to themselves and take control.
pub fn delegate_nft_inner(
    ctx: Context<DelegateNft>,
    set_delegate: bool
) -> Result<()> {
    let signer = &ctx.accounts.signer;
    let nft_account = &mut ctx.accounts.nft_account;

    if set_delegate {
        let action_allowed = nft_account.holder.key() == signer.key();
        require!(action_allowed, NftokenError::Unauthorized);

        let delegate = ctx.remaining_accounts[0].key();
        require!(delegate != NULL_PUBKEY, NftokenError::TransferUnauthorized);

        nft_account.delegate = delegate;
    } else {
        let current_delegate = &nft_account.delegate;
        let action_allowed =
            // The NFT holder can remove the delegate
            nft_account.holder.key() == signer.key()
                // The delegate can also remove the delegate
                || current_delegate.key() == signer.key();

        require!(action_allowed, NftokenError::DelegateUnauthorized);
        nft_account.delegate = NULL_PUBKEY;
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(set_delegate: bool)]
pub struct DelegateNft<'info> {
    #[account(mut)]
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
}


