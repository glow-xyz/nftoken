use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;
use anchor_lang::prelude::*;

/// This allows transferring the `authority` on a collection. When you transfer
/// the `authority` you lose all privileges and the `new_authority` gets all of your permissions.
pub fn collection_transfer_inner(ctx: Context<CollectionTransferCreator>) -> Result<()> {
    let collection = &mut ctx.accounts.collection;

    let action_allowed = collection.authority.key() == ctx.accounts.authority.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(collection.authority_can_update, NftokenError::Unauthorized);

    collection.authority = ctx.accounts.new_authority.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct CollectionTransferCreator<'info> {
    #[account(mut)]
    pub collection: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub new_authority: Signer<'info>,
}
