import { useEffect, useMemo } from 'react';
import { ApiService } from '../services/ApiService.js';
import { AppViewModel } from '../viewmodels/AppViewModel.js';

export function useAppViewModel() {
  const viewModel = useMemo(() => {
    const apiService = new ApiService('http://localhost:3000');
    return new AppViewModel(apiService);
  }, []);

  useEffect(() => {
    viewModel.syncHistory();
  }, [viewModel]);

  return viewModel;
}
