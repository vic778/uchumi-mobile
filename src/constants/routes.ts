export const Routes = {
  // auth
  login:    '/(auth)/login',
  register: '/(auth)/register',

  // member
  memberDashboard:   '/(member)/dashboard',
  memberTransactions: '/(member)/transactions',
  memberSavings:     '/(member)/savings',
  memberLoans:       '/(member)/loans',
  memberLoanApply:   '/(member)/loans/apply',
  memberWithdrawals: '/(member)/withdrawals',
  memberDocuments:   '/(member)/documents',
  memberNotifications: '/(member)/notifications',
  memberProfile:     '/(member)/profile',

  // collector
  collectorDashboard: '/(collector)/dashboard',
  collectorMembers:   '/(collector)/members',
  collectorDeposit:   '/(collector)/deposits/new',
  collectorWithdrawals: '/(collector)/withdrawals',
  collectorLoans:     '/(collector)/loans',
  collectorKyc:       '/(collector)/kyc/new',
  collectorProfile:   '/(collector)/profile',
} as const;
