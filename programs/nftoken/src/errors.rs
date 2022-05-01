use anchor_lang::prelude::*;

#[error_code]
pub enum NftokenError {
    #[msg("You don't have permission to transfer this NFT.")]
    TransferUnauthorized,
    #[msg("You don't have permission to delegate this NFT.")]
    DelegateUnauthorized,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
