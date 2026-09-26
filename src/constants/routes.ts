export const Routes = {
  // auth
  login:    '/(auth)/login',
  register: '/(auth)/register',

  // member
  memberDashboard:     '/(member)/(tabs)/dashboard',
  memberTransactions:  '/(member)/transactions',
  memberSavings:       '/(member)/(tabs)/savings',
  memberLoans:         '/(member)/(tabs)/loans',
  memberLoanApply:     '/(member)/loans/apply',
  memberWithdrawals:   '/(member)/withdrawals',
  memberDocuments:     '/(member)/documents',
  memberNotifications: '/(member)/(tabs)/notifications',
  memberProfile:       '/(member)/(tabs)/profile',

  // collector
  collectorDashboard: '/(collector)/dashboard',
  collectorMembers:   '/(collector)/members',
  collectorDeposit:   '/(collector)/deposits/new',
  collectorWithdrawals: '/(collector)/withdrawals',
  collectorLoans:     '/(collector)/loans',
  collectorKyc:       '/(collector)/kyc/new',
  collectorProfile:   '/(collector)/profile',
} as const;
