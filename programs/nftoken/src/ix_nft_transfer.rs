use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// Transfer an NFT to a different owner
///
/// Either the *owner* or the *delegate* can take this action.
pub fn transfer_nft_inner(ctx: Context<TransferNft>) -> Result<()> {
    // TODO check that you are either the delegate or the owner
    let signer = &ctx.accounts.signer;
    let nft = &mut ctx.accounts.nft;

    let delegate = nft.delegate;

    let transfer_allowed =
        // The NFT holder can make a transfer
        nft.holder.key() == signer.key()
            // So can the delegate, if the delegate is set.
            || delegate.key() == signer.key();

    let recipient = ctx.accounts.recipient.key();

    require!(recipient != NULL_PUBKEY, NftokenError::TransferUnauthorized);
    require!(transfer_allowed, NftokenError::TransferUnauthorized);

    nft.holder = recipient;
    nft.delegate = NULL_PUBKEY;

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct TransferNft<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: this can be any type
    pub recipient: AccountInfo<'info>,
}
