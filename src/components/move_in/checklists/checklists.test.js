import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Checklists from './checklists';
import { makeRequest2 } from '../../../utils/makeRequest';

jest.mock('../../../utils/makeRequest', () => ({
  makeRequest2: jest.fn(),
}));

describe('Checklists', () => {
  let container;
  let root;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    makeRequest2.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    container = null;
    root = null;
  });

  it('renders checklist data from the API', async () => {
    makeRequest2.mockResolvedValue({
      success: true,
      data: {
        data: [
          {
            unitName: 'Unit A',
            tenantName: 'Jane Tenant',
            status: 'in_progress',
            completionDate: null,
          },
        ],
      },
    });

    await act(async () => {
      root.render(<Checklists />);
    });

    expect(container.textContent).toContain('Move-In Checklists');
    expect(container.textContent).toContain('Unit A');
    expect(container.textContent).toContain('Jane Tenant');
    expect(container.textContent).toContain('in_progress');
  });
});
