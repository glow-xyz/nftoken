//! # Create Collection
//!
//! This creates a *collection* account which NFTs can be associated with.
use anchor_lang::prelude::*;

use crate::account_types::{CollectionAccount, COLLECTION_BASE_ACCOUNT_SIZE};

pub fn collection_create_inner(
    ctx: Context<CollectionCreate>,
    args: CollectionCreateArgs,
) -> Result<()> {
    let collection = &mut ctx.accounts.collection;

    collection.version = 1;
    collection.authority = ctx.accounts.authority.key();
    collection.metadata_url = args.metadata_url;
    collection.authority_can_update = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: CollectionCreateArgs)]
pub struct CollectionCreate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(init, payer = authority, space = COLLECTION_BASE_ACCOUNT_SIZE + args.metadata_url.len())]
    pub collection: Account<'info, CollectionAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct CollectionCreateArgs {
    pub metadata_url: String,
}
