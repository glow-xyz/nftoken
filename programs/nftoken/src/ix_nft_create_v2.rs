use crate::account_types::*;
use crate::errors::*;
use crate::ix_nft_create_v1::NftCreateArgs;
use anchor_lang::prelude::*;

/// # Create NFT v2
///
/// The only intended difference between V1 and V2 is that V2 lets you specify a payer for the
/// rent of the NFT account.
///
/// TODO: refactor out a function that is shared with both v1 and v2
pub fn nft_create_inner_v2(ctx: Context<NftCreateV2Context>, args: NftCreateArgs) -> Result<()> {
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
            &collection.authority == collection_authority_info.key,
            NftokenError::Unauthorized
        );

        nft.collection = *collection_info.key;
    }

    nft.version = 1;
    nft.holder = ctx.accounts.holder.key();
    nft.authority = ctx.accounts.authority.key();
    nft.authority_can_update = true;
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
pub struct NftCreateV2Context<'info> {
    pub authority: Signer<'info>,

    /// CHECK: this can be any type we want
    pub holder: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = NFT_BASE_ACCOUNT_SIZE + args.metadata_url.len())]
    pub nft: Account<'info, NftAccount>,

    pub system_program: Program<'info, System>,
}
