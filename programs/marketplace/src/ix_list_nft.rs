use crate::account_types::*;
use ::nftoken::account_types::NftAccount;
use ::nftoken::cpi::accounts::NftSetDelegate;
use ::nftoken::program::Nftoken;
use anchor_lang::prelude::*;

pub fn list_nft_inner(ctx: Context<ListNft>, args: ListNftArgs) -> Result<()> {
    let nft_listing = &mut ctx.accounts.nft_listing;
    let nft = &ctx.accounts.nft;

    nft_listing.version = 1;
    nft_listing.nft = nft.key();
    nft_listing.seller = ctx.accounts.seller.key();
    nft_listing.price_sol = args.price_sol;
    nft_listing.bump = *ctx.bumps.get("nft_listing").unwrap();

    // TODO: we need to set the delegate to the nft_listing?

    let nftoken_program = ctx.accounts.nftoken.to_account_info();
    let set_delegate_accounts = NftSetDelegate {
        nft: ctx.accounts.nft.to_account_info(),
        holder: ctx.accounts.seller.to_account_info(),
        delegate: ctx.accounts.nft_listing.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(nftoken_program, set_delegate_accounts);
    ::nftoken::cpi::nft_set_delegate_v1(cpi_ctx)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: ListNftArgs)]
pub struct ListNft<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut, constraint = nft.holder == seller.key())]
    pub nft: Account<'info, NftAccount>,

    #[account(init, seeds = ["listing".as_bytes(), &seller.key().as_ref(), &nft.key().as_ref()], bump, payer = seller, space = NFT_LISTING_ACCOUNT_SIZE)]
    pub nft_listing: Account<'info, NftListingAccount>,

    pub nftoken: Program<'info, Nftoken>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct ListNftArgs {
    pub price_sol: u64,
}
