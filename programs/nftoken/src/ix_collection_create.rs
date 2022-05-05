use anchor_lang::prelude::*;
use crate::account_types::CollectionAccount;

/// # Create Collection
///
/// This creates a *collection* account which NFTs can be associated with.
pub fn collection_create_inner(
    ctx: Context<CollectionCreate>,
    name: [u8; 32],
    image_url: [u8; 64],
    metadata_url: [u8; 64],
) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection_account;

    collection_account.version = 1;
    collection_account.creator = ctx.accounts.creator.key();
    collection_account.name = name;
    collection_account.image_url = image_url;
    collection_account.metadata_url = metadata_url;
    collection_account.creator_can_update = true;
    collection_account.created_at = ctx.accounts.clock.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 64], metadata_url: [u8; 64])]
pub struct CollectionCreate<'info> {
    #[account(init, payer = creator, space = 500)]
    pub collection_account: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}
