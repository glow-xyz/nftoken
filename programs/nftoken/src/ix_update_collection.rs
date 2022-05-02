use anchor_lang::prelude::*;
use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;

/// `update_collection` allows updating metadata about the collection on chain.
///
/// TODO: consider if we want to allow only passing in some things to update, what would that
///       look like? like if you want to update the `name` but leave everything else as default.
pub fn update_collection_inner(
    ctx: Context<UpdateCollection>,
    name: [u8; 32],
    image_url: [u8; 128],
    metadata_url: [u8; 128],
    creator_can_update: bool
) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection_account;

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
#[instruction(name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128])]
pub struct UpdateCollection<'info> {
    #[account(mut, has_one = creator)]
    pub collection_account: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}
