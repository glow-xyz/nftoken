use anchor_lang::prelude::*;
use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;

///  # Update Collection
///
/// Update the collection information on chain.
///
/// TODO: consider if we want to allow only passing in some things to update, what would that
///       look like? like if you want to update the `name` but leave everything else as default.
pub fn collection_update_inner(
    ctx: Context<CollectionUpdate>,
    name: [u8; 32],
    image_url: [u8; 64],
    metadata_url: [u8; 64],
    creator_can_update: bool
) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection;

    let action_allowed = collection_account.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(collection_account.creator_can_update, NftokenError::Unauthorized);

    collection_account.name = name;
    collection_account.image_url = image_url;
    collection_account.metadata_url = metadata_url;
    collection_account.creator_can_update = creator_can_update;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 64], metadata_url: [u8; 64])]
pub struct CollectionUpdate<'info> {
    #[account(mut, has_one = creator)]
    pub collection: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}
