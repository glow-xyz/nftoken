use anchor_lang::prelude::*;
use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;

/// This allows transferring the `creator` authority on a collection. When you transfer
/// the `creator` you lose all privileges and the `new_creator` gets all of your permissions.
pub fn collection_transfer_creator_inner(ctx: Context<CollectionTransferCreator>) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection_account;

    let action_allowed = collection_account.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(collection_account.creator_can_update, NftokenError::Unauthorized);

    collection_account.creator = ctx.accounts.new_creator.key();

    Ok(())
}


#[derive(Accounts)]
#[instruction()]
pub struct CollectionTransferCreator<'info> {
    #[account(mut)]
    pub collection_account: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub new_creator: Signer<'info>,
}
