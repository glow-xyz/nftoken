use crate::account_types::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use std::convert::TryInto;

/// # Create Mintlist
pub fn mintlist_create_inner(ctx: Context<MintlistCreate>, args: MintlistCreateArgs) -> Result<()> {
    let collection = &mut ctx.accounts.collection;
    collection.version = 1;
    collection.creator = ctx.accounts.creator.key();
    collection.metadata_url = args.collection_metadata_url;
    collection.creator_can_update = true;

    let mintlist_account = &mut ctx.accounts.mintlist;
    mintlist_account.version = 1;
    mintlist_account.creator = ctx.accounts.creator.key();
    mintlist_account.treasury_sol = ctx.accounts.treasury_sol.key();
    mintlist_account.go_live_date = args.go_live_date;
    mintlist_account.metadata_url = args.metadata_url;
    mintlist_account.price_lamports = args.price_lamports;
    mintlist_account.num_nfts_total = args.num_nfts_total;
    mintlist_account.minting_order = args.minting_order.try_into()?;
    mintlist_account.collection = collection.key();
    mintlist_account.created_at = ctx.accounts.clock.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: MintlistCreateArgs)]
pub struct MintlistCreate<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    /// Due to the 10kb limit on the size of accounts that can be initialized via CPI,
    /// the `mintlist` account must be initialized through a separate SystemProgram instruction,
    /// that can be included into the same transaction as the `mintlist_create` instruction.
    #[account(
        zero,
        constraint = mintlist.to_account_info().data_len() >= MintlistAccount::size(args.num_nfts_total) @ NftokenError::MintlistAccountTooSmall
    )]
    pub mintlist: Account<'info, MintlistAccount>,

    #[account(init, payer = creator, space = COLLECTION_DEFAULT_ACCOUNT_SIZE)]
    pub collection: Account<'info, CollectionAccount>,

    /// SOL wallet to receive proceedings from SOL payments.
    /// CHECK: this can be any type
    pub treasury_sol: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintlistCreateArgs {
    /// Information like name, avatar, etc of the mintlist is stored offchain.
    pub metadata_url: [u8; 96],

    /// We create a new collection for every Mintlist.
    pub collection_metadata_url: String,

    /// Timestamp when minting is allowed.
    pub go_live_date: i64,

    /// Price to pay for minting an NFT from the mintlist.
    pub price_lamports: u64,

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_nfts_total: u32,

    /// Order of going through the list of `MintInfo`'s during the minting process.
    /// Can be "sequential" or "random".
    pub minting_order: String,
}
