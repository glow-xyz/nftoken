use crate::account_types::*;
use crate::errors::*;
use ::nftoken::account_types::NftAccount;
use ::nftoken::cpi::accounts::NftTransfer;
use ::nftoken::program::Nftoken;
use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_lang::solana_program::system_instruction;

/// # Buy NFT
///
/// This does the following:
/// 1. ensures that the buy / sell configuration is correct
/// 2. transfers the purchase price from buyer to seller
///    - TODO: support automatically transferring royalties and fees
/// 3. transfers the NFT from seller to buyer by using the PDA
/// 4. closes the listing and returns to seller
pub fn buy_nft_inner(ctx: Context<BuyNft>, args: BuyNftArgs) -> Result<()> {
    let buyer = &ctx.accounts.buyer;
    let seller = &ctx.accounts.seller;
    let nft = &ctx.accounts.nft;
    let nft_listing = &ctx.accounts.nft_listing;

    require!(
        nft_listing.price_sol == args.price_sol,
        MarketplaceError::Unauthorized
    );
    require!(
        nft_listing.seller == seller.key(),
        MarketplaceError::Unauthorized
    );
    require!(nft_listing.nft == nft.key(), MarketplaceError::Unauthorized);

    // Pay for the NFT
    let pay_ix = system_instruction::transfer(&buyer.key(), &seller.key(), args.price_sol);
    solana_program::program::invoke(&pay_ix, &[buyer.clone().to_account_info(), seller.clone()])?;

    // Transfer from the delegate to the owner
    let nftoken_program = ctx.accounts.nftoken.to_account_info();
    let nft_transfer_accounts = NftTransfer {
        nft: nft.to_account_info(),
        signer: nft_listing.to_account_info(),
        recipient: buyer.to_account_info(),
    };
    let seeds = &[
        b"listing".as_ref(),
        seller.to_account_info().key.as_ref(),
        nft.to_account_info().key.as_ref(),
        &[nft_listing.bump],
    ];
    let signer_seeds = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(nftoken_program, nft_transfer_accounts, signer_seeds);
    ::nftoken::cpi::nft_transfer_v1(cpi_ctx)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: BuyNftArgs)]
pub struct BuyNft<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    /// CHECK: this can be any type
    pub seller: AccountInfo<'info>,

    #[account(mut, constraint = nft.holder == seller.key())]
    pub nft: Account<'info, NftAccount>,

    pub nft_listing: Account<'info, NftListingAccount>,

    pub nftoken: Program<'info, Nftoken>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct BuyNftArgs {
    pub price_sol: u64,
}
