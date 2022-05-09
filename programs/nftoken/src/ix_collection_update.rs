use crate::account_types::CollectionAccount;
use crate::errors::NftokenError;
use anchor_lang::prelude::*;

///  # Update Collection
///
/// Update the collection information on chain.
pub fn collection_update_inner(
    ctx: Context<CollectionUpdate>,
    args: CollectionUpdateArgs,
) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection;

    let action_allowed = collection_account.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(
        collection_account.creator_can_update,
        NftokenError::Unauthorized
    );

    collection_account.metadata_url = args.metadata_url;
    collection_account.creator_can_update = args.creator_can_update;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: CollectionUpdateArgs)]
pub struct CollectionUpdate<'info> {
    #[account(mut, has_one = creator)]
    pub collection: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct CollectionUpdateArgs {
    pub metadata_url: [u8; 64],
    pub creator_can_update: bool,
}
