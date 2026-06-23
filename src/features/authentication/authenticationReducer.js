import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loginEmail: '',
  loginPassword: '',
  forgotEmail: '',
  verificationCode: '',
  newPassword: '',
  confirmNewPassword: '',
  spinner: false,
  user: null,
  token: '',
  isAuthenticated: false,
};

const authenticationSlice = createSlice({
  name: 'Authentication',
  initialState,
  reducers: {
    inputLoginEmail: (state, action) => {
      state.loginEmail = action.payload;
    },
    inputLoginPassword: (state, action) => {
      state.loginPassword = action.payload;
    },
    inputForgotEmail: (state, action) => {
      state.forgotEmail = action.payload;
    },
    inputVerificationCode: (state, action) => {
      state.verificationCode = action.payload;
    },
    inputNewPassword: (state, action) => {
      state.newPassword = action.payload;
    },
    inputConfirmNewPassword: (state, action) => {
      state.confirmNewPassword = action.payload;
    },
    updateSpinner: (state, action) => {
      state.spinner = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = '';
      state.isAuthenticated = false;
    },
  },
});

export const {
  inputLoginEmail,
  inputLoginPassword,
  inputForgotEmail,
  inputVerificationCode,
  inputNewPassword,
  inputConfirmNewPassword,
  updateSpinner,
  setUser,
  setToken,
  logout,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
