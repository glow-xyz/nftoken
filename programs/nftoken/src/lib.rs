use anchor_lang::prelude::*;

declare_id!("FfqiTwF9Ez1QFZKxCEUoSr4UiYAaUb3QWGgsbG3QKSoh");

#[program]
pub mod nftoken {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: [u8; 32],
        image_url: [u8; 128],
        metadata_url: [u8; 128],
    ) -> anchor_lang::Result<()> {
        let nft_account = &mut ctx.accounts.nft_account;

        nft_account.holder = ctx.accounts.holder.key();
        nft_account.delegate = nil;
        nft_account.name = name;
        nft_account.image_url = image_url;
        nft_account.metadata_url = metadata_url;
        nft_account.collection = nil;

        Ok(())
    }
}

// TODO: is this on a PDA or what is the account?
//       should it be a PDA with seeds or an account owned by the program?
#[account]
#[derive(Default)]
pub struct NftAccount {
    pub holder: Pubkey,
    pub delegate: Option<Pubkey>,
    pub name: [u8; 32],
    pub image_url: [u8; 128],
    pub metadata_url: [u8; 128],
    pub collection: Option<Pubkey>
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 128], metadata_url: [u8, 128])]
pub struct MintNft<'info> {
    #[account(init, seeds = [&question], bump, payer = holder, space = 500)]
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum NftokenError {
    #[msg("This token account needs to match the mint, belong to the controller, and have amount > 0.")]
    InvalidTokenAccount,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
