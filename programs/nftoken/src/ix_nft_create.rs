use anchor_lang::prelude::*;
use crate::account_types::*;
use crate::errors::*;

/// # Create NFT
///
/// This sets the current `holder == creator == signer` so this is useful if you are creating
/// NFTs that you will be the manager of.
///
/// If you want to let other people mint your NFTs, you should use the upcoming Mintlist feature.
pub fn nft_create_inner(
    ctx: Context<NftCreate>,
    name: [u8; 32],
    image_url: [u8; 64],
    metadata_url: [u8; 64],
    collection_included: bool,
) -> Result<()> {
    let nft_account = &mut ctx.accounts.nft;

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

    nft_account.version = 1;
    nft_account.holder = ctx.accounts.holder.key();
    nft_account.creator = ctx.accounts.holder.key();
    nft_account.name = name;
    nft_account.image_url = image_url;
    nft_account.metadata_url = metadata_url;
    nft_account.created_at = ctx.accounts.clock.unix_timestamp;
    nft_account.creator_can_update = true;

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
    image_url: [u8; 64],
    metadata_url: [u8; 64],
    collection_included: bool
)]
pub struct NftCreate<'info> {
    // TODO: we should choose the size for this so that creating an NFToken is at least 2x cheaper than a Metaplex NFT
    #[account(init, payer = holder, space = 500)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

