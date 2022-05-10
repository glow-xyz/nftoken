use crate::account_types::*;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Create NFT
///
/// This sets the current `creator == signer` so this is useful if you are creating
/// NFTs that you will be the manager of.
///
/// If you want to let other people mint your NFTs, you should use the `Mintlist` feature.
pub fn nft_create_inner(ctx: Context<NftCreate>, args: NftCreateArgs) -> Result<()> {
    let nft = &mut ctx.accounts.nft;

    if args.collection_included {
        let collection_info: &AccountInfo = &ctx.remaining_accounts[0];
        require!(
            collection_info.owner == ctx.program_id,
            NftokenError::Unauthorized
        );

        let mut collection_data: &[u8] = &collection_info.try_borrow_data()?;
        let collection = CollectionAccount::try_deserialize(&mut collection_data)?;

        let collection_authority_info = &ctx.remaining_accounts[1];

        require!(
            collection_authority_info.is_signer,
            NftokenError::Unauthorized
        );
        require!(
            &collection.creator == collection_authority_info.key,
            NftokenError::Unauthorized
        );

        nft.collection = *collection_info.key;
    }

    nft.version = 1;
    nft.holder = ctx.accounts.holder.key();
    nft.creator = ctx.accounts.creator.key();
    nft.creator_can_update = true;
    nft.metadata_url = args.metadata_url;

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
#[instruction(args: NftCreateArgs)]
pub struct NftCreate<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: this can be any type we want
    pub holder: AccountInfo<'info>,

    #[account(init, payer = creator, space = NFT_ACCOUNT_SIZE)]
    pub nft: Account<'info, NftAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct NftCreateArgs {
    pub metadata_url: [u8; 64],
    pub collection_included: bool,
}
