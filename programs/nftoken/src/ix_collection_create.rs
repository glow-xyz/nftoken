use crate::account_types::CollectionAccount;
use crate::constants::COLLECTION_ACCOUNT_SIZE;
use anchor_lang::prelude::*;

/// # Create Collection
///
/// This creates a *collection* account which NFTs can be associated with.
pub fn collection_create_inner(
    ctx: Context<CollectionCreate>,
    args: CollectionCreateArgs,
) -> Result<()> {
    let collection = &mut ctx.accounts.collection;

    collection.version = 1;
    collection.creator = ctx.accounts.creator.key();
    collection.metadata_url = args.metadata_url;
    collection.creator_can_update = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: CollectionCreateArgs)]
pub struct CollectionCreate<'info> {
    #[account(init, payer = creator, space = COLLECTION_ACCOUNT_SIZE)]
    pub collection: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct CollectionCreateArgs {
    pub metadata_url: [u8; 64],
}
