use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;
use anchor_lang::prelude::*;

/// This allows transferring the `creator` authority on a collection. When you transfer
/// the `creator` you lose all privileges and the `new_creator` gets all of your permissions.
pub fn collection_transfer_creator_inner(ctx: Context<CollectionTransferCreator>) -> Result<()> {
    let collection = &mut ctx.accounts.collection;

    let action_allowed = collection.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(collection.creator_can_update, NftokenError::Unauthorized);

    collection.creator = ctx.accounts.new_creator.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct CollectionTransferCreator<'info> {
    #[account(mut)]
    pub collection: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub new_creator: Signer<'info>,
}
