import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useVisit, type VisitReturnType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig, esmPatientChartSchema } from '../config-schema';
import { mockPatient } from 'tools';
import StartVisitOverflowMenuItem from './start-visit.component';

const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockUseVisit = jest.mocked(useVisit);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(esmPatientChartSchema),
});

mockUseVisit.mockReturnValue({
  currentVisit: null,
} as VisitReturnType);

describe('StartVisitOverflowMenuItem', () => {
  it('should launch the start visit form', async () => {
    const user = userEvent.setup();

    render(<StartVisitOverflowMenuItem patient={mockPatient} />);

    const startVisitButton = screen.getByRole('menuitem', { name: /start visit/i });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);
    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      openedFrom: 'patient-chart-start-visit',
    });
  });

  it('should not show start visit button for a deceased patient', () => {
    render(
      <StartVisitOverflowMenuItem
        patient={{
          ...mockPatient,
          deceasedDateTime: '2023-05-07T10:20:30Z',
        }}
      />,
    );

    const startVisitButton = screen.queryByRole('menuitem', { name: /start visit/i });
    expect(startVisitButton).not.toBeInTheDocument();
  });
});
