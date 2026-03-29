// Mock Database for Demo Mode
const STORAGE_KEY = 'royal_games_demo_data';

interface MockData {
  users: Record<string, any>;
  sessions: any[];
  depositRequests: any[];
  withdrawalRequests: any[];
}

const getInitialData = (): MockData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure admin exists
      if (!parsed.users['251952779456']) {
        parsed.users['251952779456'] = {
          uid: '251952779456',
          phoneNumber: '+251952779456',
          email: 'mamofar925@gmail.com',
          displayName: 'Admin',
          role: 'admin',
          balance: 1000,
          demoBalance: 10000,
          createdAt: new Date().toISOString()
        };
      }
      // Ensure all users have demoBalance and balance
      Object.keys(parsed.users).forEach(uid => {
        if (parsed.users[uid].demoBalance === undefined) {
          parsed.users[uid].demoBalance = 10000;
        }
        parsed.users[uid].balance = 0;
      });
      return {
        users: parsed.users || {},
        sessions: parsed.sessions || [],
        depositRequests: parsed.depositRequests || [],
        withdrawalRequests: parsed.withdrawalRequests || []
      };
    } catch (e) {
      console.error("Error parsing stored data", e);
    }
  }
  return {
    users: {
      '251952779456': {
        uid: '251952779456',
        phoneNumber: '+251952779456',
        email: 'mamofar925@gmail.com',
        displayName: 'Admin',
        role: 'admin',
        balance: 0,
        demoBalance: 10000,
        createdAt: new Date().toISOString()
      }
    },
    sessions: [],
    depositRequests: [],
    withdrawalRequests: []
  };
};

let data = getInitialData();

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const mockDb = {
  getUser: (uid: string) => data.users[uid] || null,
  setUser: (uid: string, userData: any) => {
    data.users[uid] = { ...data.users[uid], ...userData };
    save();
  },
  getAllUsers: () => Object.values(data.users),
  addSession: (session: any) => {
    data.sessions.unshift({ id: Math.random().toString(36).substr(2, 9), ...session, timestamp: new Date().toISOString() });
    save();
  },
  getSessions: () => data.sessions,
  addDepositRequest: (request: any) => {
    data.depositRequests.unshift({ id: Math.random().toString(36).substr(2, 9), ...request, status: 'pending', timestamp: new Date().toISOString() });
    save();
  },
  getDepositRequests: () => data.depositRequests,
  updateDepositStatus: (id: string, status: 'approved' | 'rejected') => {
    const req = data.depositRequests.find(r => r.id === id);
    if (req && req.status === 'pending') {
      req.status = status;
      if (status === 'approved') {
        const user = data.users[req.userId];
        if (user) {
          user.balance += req.amount;
        }
      }
      save();
    }
  },
  addWithdrawalRequest: (request: any) => {
    const user = data.users[request.userId];
    if (user && user.balance >= request.amount) {
      user.balance -= request.amount;
      data.withdrawalRequests.unshift({ id: Math.random().toString(36).substr(2, 9), ...request, status: 'pending', timestamp: new Date().toISOString() });
      save();
      return true;
    }
    return false;
  },
  getWithdrawalRequests: () => data.withdrawalRequests,
  updateWithdrawalStatus: (id: string, status: 'approved' | 'rejected') => {
    const req = data.withdrawalRequests.find(r => r.id === id);
    if (req && req.status === 'pending') {
      req.status = status;
      if (status === 'rejected') {
        const user = data.users[req.userId];
        if (user) {
          user.balance += req.amount;
        }
      }
      save();
    }
  },
  clear: () => {
    data = { users: {}, sessions: [], depositRequests: [], withdrawalRequests: [] };
    save();
  }
};

export const mockAuth = {
  currentUser: null as any,
  onAuthStateChanged: (callback: (user: any) => void) => {
    const storedUser = localStorage.getItem('royal_games_demo_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      mockAuth.currentUser = user;
      callback(user);
    } else {
      callback(null);
    }
    return () => {};
  },
  signIn: (user: any) => {
    mockAuth.currentUser = user;
    localStorage.setItem('royal_games_demo_user', JSON.stringify(user));
  },
  signOut: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('royal_games_demo_user');
  }
};
