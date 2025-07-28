export type Language = 'en' | 'hi' | 'mr';

export interface TranslationKeys {
  // Application Branding
  appName: string;
  appDescription: string;
  
  // Common UI Elements
  common: {
    login: string;
    logout: string;
    welcome: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    refresh: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    active: string;
    inactive: string;
    blocked: string;
    online: string;
    offline: string;
    connected: string;
    running: string;
    secure: string;
    total: string;
    today: string;
    thisMonth: string;
    thisYear: string;
  };

  // Navigation
  navigation: {
    dashboard: string;
    overview: string;
    systemOverview: string;
    voterManagement: string;
    electionOfficers: string;
    officerManagement: string;
    systemSettings: string;
    securityLogs: string;
    reports: string;
    analytics: string;
    locationTracking: string;
    dataManagement: string;
    agentTracking: string;
    transactionManagement: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    masterAdminTitle: string;
    masterAdminSubtitle: string;
    totalRevenue: string;
    totalVoters: string;
    registeredVoters: string;
    pendingRegistrations: string;
    activeOfficers: string;
    totalRegistrations: string;
    registrationSuccessRate: string;
    systemUptime: string;
    officerActivity: string;
    totalDistribution: string;
    totalAgents: string;
    distributedBy: string;
    switchToMode: string;
  };

  // Voter Management
  voters: {
    title: string;
    totalVoters: string;
    registeredVoters: string;
    pendingRegistrations: string;
    voterDetails: string;
    voterId: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    registrationDate: string;
    registeredBy: string;
    amount: string;
    status: string;
    registered: string;
    pending: string;
    constituency: string;
    pollingStation: string;
  };

  // Election Officers
  officers: {
    title: string;
    officerManagement: string;
    totalOfficers: string;
    activeOfficers: string;
    officerId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    username: string;
    password: string;
    status: string;
    lastLocation: string;
    registrationsToday: string;
    totalRegistrations: string;
    location: string;
    pollingStation: string;
    constituency: string;
    addOfficer: string;
    editOfficer: string;
    blockOfficer: string;
    unblockOfficer: string;
  };

  // System
  system: {
    systemHealth: string;
    performanceMetrics: string;
    databaseStatus: string;
    apiServices: string;
    paymentGateway: string;
    securityStatus: string;
    systemAnalytics: string;
    recentActivity: string;
    officerLocations: string;
    systemPerformance: string;
    userStatistics: string;
    registrationTimeline: string;
    noRegistrationsYet: string;
    noTransactionsYet: string;
    recentTransactionActivity: string;
  };

  // Authentication
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    username: string;
    password: string;
    role: string;
    admin: string;
    masterAdmin: string;
    supervisor: string;
    electionOfficer: string;
    loginButton: string;
    invalidCredentials: string;
    selectRole: string;
    loginFailed: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    allRightsReserved: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    defaultRegistrationAmount: string;
    sessionTimeout: string;
    notifications: string;
    systemConfiguration: string;
  };

  // Time and Date
  time: {
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    ago: string;
    now: string;
  };

  // Status Messages
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    dataLoaded: string;
    dataSaved: string;
    dataDeleted: string;
    noDataFound: string;
    operationSuccessful: string;
    operationFailed: string;
  };

  // Data Management
  dataManagement: {
    title: string;
    subtitle: string;
    dataExport: string;
    exportUsers: string;
    exportAgents: string;
    exportAllData: string;
    exportTransactions: string;
    searchTransactions: string;
    transactionId: string;
    user: string;
    agent: string;
    amount: string;
    location: string;
    timestamp: string;
    noDataAvailable: string;
  };

  // Transaction Management
  transactions: {
    title: string;
    transactionId: string;
    userId: string;
    agentId: string;
    amount: string;
    location: string;
    status: string;
    dateTime: string;
    totalAmount: string;
    totalTransactions: string;
    completed: string;
    pending: string;
    failed: string;
    search: string;
    searchTransactions: string;
    allStatus: string;
    startDate: string;
    endDate: string;
    exportTransactions: string;
    failedToExport: string;
    na: string;
  };

  // User Management
  userManagement: {
    title: string;
    userDatabase: string;
    agentDatabase: string;
    searchUsers: string;
    searchOfficers: string;
    totalPayments: string;
    subtitle: string;
    uploadVoterData: string;
    dragDropExcel: string;
    importVoterData: string;
    amountNote: string;
    chooseFile: string;
    uploading: string;
    downloadTemplate: string;
    voterDatabase: string;
    searchResults: string;
    found: string;
    total: string;
    clearSearch: string;
    advancedSearch: string;
    exportData: string;
    addVoter: string;
    voters: string;
    addNewVoter: string;
    editVoter: string;
    deleteConfirmation: string;
    fileUploadSuccess: string;
    fileUploadFailed: string;
    templateDownloadSuccess: string;
    templateDownloadFailed: string;
    searchCleared: string;
    validationFailed: string;
    notDistributed: string;
    amountDistributed: string;
    distributionDateTime: string;
    male: string;
    female: string;
    other: string;
    vidhansabhaConstituency: string;
    selectVidhansabha: string;
    vibhaghKramank: string;
    divisionSectionNumber: string;
    amountDistributedRupees: string;
    saveChanges: string;
    amountCanOnlyBeSetByAgents: string;
  };

  agentManagement: {
    title: string;
    subtitle: string;
    addNewAgent: string;
    createAgent: string;
    creating: string;
    agentDetails: string;
    viewActivity: string;
    blockAgent: string;
    unblockAgent: string;
    agentId: string;
    username: string;
    lastLocation: string;
    paymentsToday: string;
    totalPayments: string;
    unknown: string;
    noLocationData: string;
    latitude: string;
    longitude: string;
    agentLocation: string;
    noLocationDataAvailable: string;
    agentHasntSharedLocation: string;
    deleteConfirmation: string;
    agentCreatedSuccessfully: string;
    agentUpdatedSuccessfully: string;
    agentDeletedSuccessfully: string;
    agentBlockedSuccessfully: string;
    agentUnblockedSuccessfully: string;
    failedToUpdateAgent: string;
    failedToDeleteAgent: string;
    failedToBlockAgent: string;
    failedToUnblockAgent: string;
    noTransactionsFound: string;
    credentialsNote: string;
    newPasswordNote: (password: string) => string;
  };



  // Danger Zone
  dangerZone: {
    title: string;
    emergencyDataWipe: string;
    wipeAllData: string;
    wipeDescription: string;
    confirmationWarning: string;
    finalWarning: string;
    functionalityNotAvailable: string;
  };

  // Form labels and buttons
  forms: {
    firstName: string;
    lastName: string;
    mobile: string;
    mobileNumber: string;
    email: string;
    address: string;
    password: string;
    newPassword: string;
    newPasswordOptional: string;
    leaveEmptyToKeepCurrent: string;
    interfaceStatus: string;
    issueReportingInterface: string;
    moneyDistributionInterface: string;
    controlsWhichInterface: string;
    lastLocation: string;
    canBeChanged: string;
    saveChanges: string;
    cancel: string;
    create: string;
    update: string;
    block: string;
    unblock: string;
    resetPassword: string;
    addNewAgent: string;
    addNewVoter: string;
    editVoter: string;
    age: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    unknown: string;
  };

  // Table Headers and Labels
  table: {
    id: string;
    agentId: string;
    adminId: string;
    name: string;
    age: string;
    gender: string;
    vidhansabhaNo: string;
    vibhaghKramank: string;
    distributionStatus: string;
    mobile: string;
    username: string;
    status: string;
    interface: string;
    lastLocation: string;
    paymentsToday: string;
    totalPayments: string;
    createdBy: string;
    role: string;
    createdDate: string;
    actions: string;
    distributed: string;
    pending: string;
    distributedBy: string;
    moneyDistribution: string;
    issueReporting: string;
    subAdmin: string;
    supervisor: string;
    master: string;
    todaysDistribution: string;
    totalDistribution: string;
    agents: string;
    liveData: string;
    viewOnMap: string;
    noGPS: string;
    live: string;
    offline: string;
  };

  // Status and Messages
  status: {
    active: string;
    inactive: string;
    blocked: string;
    online: string;
    offline: string;
    paid: string;
    unpaid: string;
  };

  // Action Messages
  actions: {
    viewDetails: string;
    editAgent: string;
    editAdmin: string;
    editVoter: string;
    deleteAgent: string;
    deleteAdmin: string;
    deleteVoter: string;
    blockAgent: string;
    unblockAgent: string;
    blockAdmin: string;
    unblockAdmin: string;
    resetPassword: string;
    agentCreatedSuccessfully: string;
    adminCreatedSuccessfully: string;
    voterCreatedSuccessfully: string;
    provideCredentialsManually: string;
    missingInformation: string;
    fillAllRequiredFields: string;
    operationSuccessful: string;
    operationFailed: string;
    validationError: string;
    phoneNumberRequired: string;
    phoneNumberTooShort: string;
    phoneNumberTooLong: string;
    phoneNumberInvalid: string;
    phoneNumberExists: string;
    passwordRequired: string;
    passwordTooShort: string;
    nameRequired: string;
    networkError: string;
    serverError: string;
    unknownError: string;
  };

  // Navigation and Sections
  sections: {
    issueManagement: string;
    dataManagement: string;
    systemSettings: string;
    securityLogs: string;
    locationTracking: string;
    voterSearchResults: string;
    voterDatabase: string;
    agentDatabase: string;
    noVotersFound: string;
    noAgentsFound: string;
    noUsersCreatedByAgents: string;
    noAgentsCreatedBySubAdmins: string;
    agentLocationsMap: string;
    loadingAgentLocations: string;
    noAgentsSharing: string;
    agentsWillAppear: string;
    searchAgentsPlaceholder: string;
    allStatus: string;
    disconnected: string;
    dataManagementSecurity: string;
    manageSystemData: string;
    dataExportExcel: string;
    exporting: string;
    exportUsers: string;
    exportAgents: string;
    exportAllData: string;
  };

  // Placeholders and Search
  placeholders: {
    searchVoters: string;
    searchAgents: string;
    searchAdmins: string;
    enterMobileNumber: string;
    enterPassword: string;
    selectVidhansabha: string;
    divisionSectionNumber: string;
  };

  // Labels and Descriptions
  labels: {
    vidhansabhaConstituency: string;
    vibhaghKramank: string;
    found: string;
    results: string;
  };

  // Modal and Dialog Titles
  modals: {
    addAgent: string;
    editAgent: string;
    addAdmin: string;
    editAdmin: string;
    addVoter: string;
    editVoter: string;
    deleteConfirmation: string;
    areYouSure: string;
    thisActionCannotBeUndone: string;
    viewDetails: string;
    agentDetails: string;
    voterDetails: string;
    adminDetails: string;
  };

  // Buttons and Actions
  buttons: {
    addNew: string;
    createNew: string;
    saveChanges: string;
    discardChanges: string;
    confirmDelete: string;
    viewAll: string;
    showMore: string;
    showLess: string;
    exportData: string;
    importData: string;
    downloadReport: string;
    generateReport: string;
    refreshData: string;
    clearFilters: string;
    applyFilters: string;
    resetForm: string;
    goBack: string;
    continue: string;
    finish: string;
    done: string;
  };

  // Error Messages
  errors: {
    somethingWentWrong: string;
    networkError: string;
    serverError: string;
    validationError: string;
    unauthorizedAccess: string;
    sessionExpired: string;
    fileUploadFailed: string;
    dataSaveFailed: string;
    dataLoadFailed: string;
    invalidInput: string;
    requiredFieldMissing: string;
    phoneNumberInvalid: string;
    emailInvalid: string;
    passwordTooWeak: string;
    confirmPasswordMismatch: string;
  };

  // Success Messages
  success: {
    dataSaved: string;
    dataUpdated: string;
    dataDeleted: string;
    operationCompleted: string;
    fileUploaded: string;
    emailSent: string;
    passwordChanged: string;
    profileUpdated: string;
    settingsSaved: string;
  };

  // Tooltips and Help Text
  tooltips: {
    clickToEdit: string;
    clickToView: string;
    clickToDelete: string;
    dragToReorder: string;
    requiredField: string;
    optionalField: string;
    searchHint: string;
    noDataAvailable: string;
    loadingData: string;
    selectOption: string;
    chooseFile: string;
  };

  // Issue Management
  issues: {
    title: string;
    ticketNumber: string;
    issueTitle: string;
    description: string;
    category: string;
    priority: string;
    agent: string;
    submitted: string;
    media: string;
    location: string;
    locationDetails: string;
    noDescription: string;
    noMedia: string;
    viewMedia: string;
    totalIssues: string;
    openIssues: string;
    inProgressIssues: string;
    resolvedIssues: string;
    closedIssues: string;
    filterByStatus: string;
    filterByCategory: string;
    filterByPriority: string;
    allStatuses: string;
    allCategories: string;
    allPriorities: string;
    pending: string;
    inProgress: string;
    resolved: string;
    closed: string;
    low: string;
    medium: string;
    high: string;
    critical: string;
    infrastructure: string;
    utilities: string;
    safety: string;
    environment: string;
    other: string;
    manageIssuesReported: string;
    export: string;
    searchIssues: string;
    issueDetails: string;
    manageIssue: string;
    updateStatus: string;
    addComment: string;
    enterComment: string;
    previousComments: string;
    address: string;
    area: string;
    village: string;
    district: string;
    noLocationData: string;
    locationNotAvailable: string;
    viewOnGoogleMaps: string;
    manageIssueTitle: string;
    statusUpdatedSuccessfully: string;
    failedToUpdateStatus: string;
    commentAddedSuccessfully: string;
    failedToAddComment: string;
    failedToLoadIssues: string;
    pleaseRetryAgain: string;
    open: string;
    fromDate: string;
    toDate: string;
    status: string;
    allStatus: string;
    addCommentButton: string;
  };
}
