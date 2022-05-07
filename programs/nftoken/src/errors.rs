use anchor_lang::prelude::*;

#[error_code]
pub enum NftokenError {
    #[msg("You don't have permission to transfer this NFT")]
    TransferUnauthorized,
    #[msg("You don't have permission to delegate this NFT")]
    DelegateUnauthorized,
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("`mintlist` account is too small")]
    MintlistAccountTooSmall,
    #[msg("Invalid `minting_order`. Must be one of `sequential` or `random`")]
    InvalidMintingOrder,
}
