import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import expireReducer from 'redux-persist-transform-expire';

import rootReducer from './root-reducer';
import rootSaga from './root-saga';

// Khởi tạo middleware saga
const sagaMiddleware = createSagaMiddleware();

// Cấu hình expire cho các reducer có thời gian hết hạn
const expireConfig = {
  expireKey: 'expireAt',
  expireSeconds: 60*60*1, // 1 ngày
  autoExpire: true,
};

// Cấu hình persist tổng
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['Auth', 'Search', 'hotel', 'Room', 'ChatBox', 'Socket'], // auth vĩnh viễn, booking sẽ expire
  transforms: [
    expireReducer('Search', expireConfig),
    expireReducer('hotel', expireConfig),
    expireReducer('Room', expireConfig),
    expireReducer('ChatBox', expireConfig),
    expireReducer('Socket', expireConfig),
  ],
};

// Gộp persist vào reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

// Chạy saga
sagaMiddleware.run(rootSaga);

// Tạo persistor để dùng trong <PersistGate>
export const persistor = persistStore(store);

// Custom hooks không type
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

export default store;
