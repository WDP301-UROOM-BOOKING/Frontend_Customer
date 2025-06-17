import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from "./root-reducer"
import rootSaga from "./root-saga"

// Khởi tạo middleware saga
const sagaMiddleware = createSagaMiddleware()

// Cấu hình persist KHÔNG dùng expire transform nữa
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["Auth", "Search", "hotel", "Room", "ChatBox", "Socket"],
  // Bỏ transforms vì chúng ta sẽ tự handle expire
};

// Gộp persist vào reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Tạo store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
})

// Chạy saga
sagaMiddleware.run(rootSaga)

// Tạo persistor để dùng trong <PersistGate>
export const persistor = persistStore(store)

// Custom hooks
export const useAppDispatch = useDispatch
export const useAppSelector = useSelector

export default store
