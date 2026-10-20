/**
 * Prize-campaign guardrails. This is a configuration proposal, NOT a live
 * scratch-card game, voucher issuer, QR validator or payment integration.
 * Activation requires Polish legal review, published terms and secure server
 * redemption with a verified purchase or staff authorization.
 */
export const rewardCampaign = {
  enabled: false,
  currency: "PLN",
  maxGrandPrizeValuePln: 500,
  grandPrizeMaxPeople: 2,
  customerMilestones: [
    { verifiedVisits: 1, suggestedRewards: ["coffee", "empanada", "small_arepa"] },
    { verifiedVisits: 100, suggestedRewards: ["main_course"] },
    { verifiedVisits: 200, suggestedRewards: ["meal_for_two"] },
  ],
  requirements: {
    authenticatedCustomer: true,
    verifiedPurchaseOrStaffAuthorization: true,
    oneTimeServerIssuedToken: true,
    tokenExpiryRequired: true,
    serverSideAtomicRedemption: true,
    auditTrail: true,
    antiReplay: true,
    explicitConsentForMarketing: true,
    publishedTermsAndEligibility: true,
    legalReviewBeforeLaunch: true,
  },
} as const;

/**
 * This function must never decide eligibility from client-provided visits.
 * All counters and redemption decisions belong on the authenticated server.
 */
export function canLaunchRewardCampaign(input: {
  legalApproved: boolean;
  termsPublished: boolean;
  atomicRedemptionReady: boolean;
  qrVerificationReady: boolean;
}): boolean {
  return rewardCampaign.enabled &&
    input.legalApproved &&
    input.termsPublished &&
    input.atomicRedemptionReady &&
    input.qrVerificationReady;
}
