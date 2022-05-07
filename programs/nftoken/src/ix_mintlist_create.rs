use std::convert::TryInto;
use anchor_lang::prelude::*;
use crate::account_types::*;
use crate::errors::*;


/// # Create Mintlist
pub fn mintlist_create_inner(ctx: Context<MintlistCreate>, args: MintlistCreateArgs) -> Result<()> {
    let mintlist_account = &mut ctx.accounts.mintlist.load_init()?;

    mintlist_account.version = 1;
    mintlist_account.creator = ctx.accounts.creator.key();
    mintlist_account.treasury_sol = args.treasury_sol;
    mintlist_account.go_live_date = args.go_live_date;
    mintlist_account.price = args.price;
    mintlist_account.num_mints = args.num_mints;
    mintlist_account.minting_order = args.minting_order.try_into()?;
    mintlist_account.created_at = ctx.accounts.clock.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: MintlistCreateArgs)]
pub struct MintlistCreate<'info> {
    /// Due to the 10kb limit on the size of accounts that can be initialized via CPI,
    /// the `mintlist` account must be initialized through a separate SystemProgram instruction,
    /// that can be included into the same transaction as the `mintlist_create` instruction.
    #[account(
        zero,
        constraint = mintlist.to_account_info().data_len() >= MintlistAccount::size(args.num_mints) @ NftokenError::MintlistAccountTooSmall
    )]
    pub mintlist: AccountLoader<'info, MintlistAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintlistCreateArgs {
    /// SOL wallet to receive proceedings from SOL payments.
    pub treasury_sol: Pubkey,

    /// Timestamp when minting is allowed.
    pub go_live_date: i64,

    /// Price to pay for minting an NFT from the mintlist.
    pub price: u64,

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_mints: u16,

    /// Order of going through the list of `MintInfo`'s during the minting process.
    /// Can be "sequential" or "random".
    pub minting_order: String,
}
