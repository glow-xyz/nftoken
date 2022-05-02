use anchor_lang::prelude::*;
use crate::state::CollectionAccount;
use crate::errors::NftokenError;

/// # Create Collection
///
/// This creates a *collection* account which NFTs can be associated with.
pub fn create_collection_inner(
    ctx: Context<CreateCollection>,
    name: [u8; 32],
    image_url: [u8; 128],
    metadata_url: [u8; 128],
) -> Result<()> {
    let collection_account = &mut ctx.accounts.collection_account;

    collection_account.creator = ctx.accounts.creator.key();
    collection_account.name = name;
    collection_account.image_url = image_url;
    collection_account.metadata_url = metadata_url;
    collection_account.creator_can_update = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128])]
pub struct CreateCollection<'info> {
    #[account(init, payer = creator, space = 500)]
    pub collection_account: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}
