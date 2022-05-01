use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

pub fn mint_nft_inner(
    ctx: Context<MintNft>,
    name: [u8; 32],
    image_url: [u8; 128],
    metadata_url: [u8; 128],
    collection_included: bool,
) -> Result<()> {
    let nft_account = &mut ctx.accounts.nft_account;

    if collection_included {
        let collection_info: &AccountInfo = &ctx.remaining_accounts[0];
        require!(collection_info.owner == ctx.program_id, NftokenError::Unauthorized);

        let mut collection_data: &[u8] = &collection_info.try_borrow_data()?;
        let collection_account = CollectionAccount::try_deserialize(&mut collection_data)?;

        let collection_authority_info = &ctx.remaining_accounts[1];

        require!( collection_authority_info.is_signer, NftokenError::Unauthorized);
        require!(
                &collection_account.creator == collection_authority_info.key,
                NftokenError::Unauthorized
            );

        nft_account.collection = *collection_info.key;
    }

    nft_account.holder = ctx.accounts.holder.key();
    nft_account.creator = ctx.accounts.holder.key();
    nft_account.name = name;
    nft_account.image_url = image_url;
    nft_account.metadata_url = metadata_url;

    Ok(())
}



/// This is the instruction data that gets passed into the `mint_nft` instruction.
///
/// # Remaining Accounts
///
/// If we want to include a collection, we specify:
/// * `collection` - this is the address of the collection
/// * `collection_authority` - this should be the update authority on the collection
///                            in the future this could be the `mint_authority`
#[derive(Accounts)]
#[instruction(
    name: [u8; 32],
    image_url: [u8; 128],
    metadata_url: [u8; 128],
    collection_included: bool
)]
pub struct MintNft<'info> {
    #[account(init, payer = holder, space = 500)]
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,

    pub system_program: Program<'info, System>,
}

