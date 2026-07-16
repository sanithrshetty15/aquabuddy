import { useRobotStore } from '../store/robot.store';

export const useRobot = () => {
  const store = useRobotStore();

  return {
    robots: store.robots,
    purchases: store.purchases,
    isLoading: store.isLoading,
    error: store.error,
    
    // Loading States
    fetchRobotsLoading: store.fetchRobotsLoading,
    fetchPurchasesLoading: store.fetchPurchasesLoading,
    linkRobotLoading: store.linkRobotLoading,
    submitPurchaseLoading: store.submitPurchaseLoading,
    approvePurchaseLoading: store.approvePurchaseLoading,
    rejectPurchaseLoading: store.rejectPurchaseLoading,
    updateRobotStatusLoading: store.updateRobotStatusLoading,
    createRobotLoading: store.createRobotLoading,

    // Error States
    fetchRobotsError: store.fetchRobotsError,
    fetchPurchasesError: store.fetchPurchasesError,
    linkRobotError: store.linkRobotError,
    submitPurchaseError: store.submitPurchaseError,
    approvePurchaseError: store.approvePurchaseError,
    rejectPurchaseError: store.rejectPurchaseError,
    updateRobotStatusError: store.updateRobotStatusError,
    createRobotError: store.createRobotError,

    // Pagination
    robotsPagination: store.robotsPagination,
    purchasesPagination: store.purchasesPagination,

    fetchRobots: store.fetchRobots,
    fetchPurchases: store.fetchPurchases,
    linkRobot: store.linkRobot,
    submitPurchase: store.submitPurchase,
    approvePurchase: store.approvePurchase,
    rejectPurchase: store.rejectPurchase,
    updateRobotStatus: store.updateRobotStatus,
    createRobot: store.createRobot,
  };
};
