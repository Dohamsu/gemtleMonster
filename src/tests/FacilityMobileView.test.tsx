
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FacilityMobileView from '../ui/facility/FacilityMobileView'

// Mock Stores
const mockAssignedMonsters = {
    'herb_farm': ['monster_1']
}
const mockPlayerMonsters = [
    { id: 'monster_1', name: 'Slime' },
    { id: 'monster_2', name: 'Goblin' }
]

vi.mock('../../store/useFacilityStore', () => ({
    useFacilityStore: Object.assign(
        (selector: any) => {
            const state = {
                assignedMonsters: mockAssignedMonsters,
                lastCollectedAt: {},
                productionModes: {}
            }
            return selector ? selector(state) : state
        },
        {
            getState: () => ({
                lastCollectedAt: {},
                assignedMonsters: mockAssignedMonsters,
                productionModes: {}
            })
        }
    )
}))

vi.mock('../../store/useAlchemyStore', () => ({
    useAlchemyStore: (selector: any) => {
        const state = {
            playerMaterials: { 'gold': 1000 },
            playerMonsters: mockPlayerMonsters
        }
        return selector ? selector(state) : state
    }
}))

// Mock Data
vi.mock('../../data/monsterData', () => ({
    MONSTER_DATA: {
        'slime': { name: 'Slime', factoryTrait: null }
    }
}))

// Mock Utils
vi.mock('../../utils/facilityUtils', () => ({
    calculateFacilityBonus: () => ({ speed: 0 })
}))

// Mock Hooks
vi.mock('../../hooks/useCollectionProgress', () => ({
    useCollectionProgress: () => 50 // 50% progress
}))

// Mock Components
vi.mock('../FacilityIcon', () => ({
    default: () => <div data-testid="facility-icon">Icon</div>
}))

// Mock Sub-components
vi.mock('../ui/facility/FacilityDetailModal', () => ({
    default: ({ onClose, onUpgrade }: any) => (
        <div data-testid="facility-detail-modal">
            <button onClick={onClose}>Close Modal</button>
            <button onClick={() => onUpgrade('herb_farm', { gold: 100 })}>Upgrade</button>
        </div>
    )
}))

vi.mock('../ui/dispatch/DispatchMainModal', () => ({
    default: ({ onClose }: any) => (
        <div data-testid="dispatch-main-modal">
            <button onClick={onClose}>Close Dispatch</button>
        </div>
    )
}))

describe('FacilityMobileView', () => {
    const mockFacilities = [
        {
            id: 'herb_farm',
            name: '약초 농장',
            description: 'produces herbs',
            type: 'production',
            levels: [
                { level: 1, stats: { intervalSeconds: 10, bundlesPerTick: 1 } }
            ]
        },
        {
            id: 'dungeon_dispatch',
            name: '파견',
            description: 'send monsters',
            type: 'special',
            levels: [
                { level: 1 }
            ]
        }
    ] as any[]

    const mockPlayerFacilities = {
        'herb_farm': 1,
        'dungeon_dispatch': 1
    }

    const mockUpgradeFacility = vi.fn()
    const mockOnBack = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders list of facilities', () => {
        render(
            <FacilityMobileView
                facilities={mockFacilities}
                playerFacilities={mockPlayerFacilities}
                loading={false}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )

        expect(screen.getByText('약초 농장')).toBeInTheDocument()
        expect(screen.getByText('파견')).toBeInTheDocument()
        expect(screen.getByText('시설 관리')).toBeInTheDocument()
    })

    it('renders skeleton when loading', () => {
        const { container } = render(
            <FacilityMobileView
                facilities={[]}
                playerFacilities={{}}
                loading={true}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )
        // Check for skeleton animation style presence or specific structure
        // Since skeleton is inline style, we check if multiple distinct items are rendered
        // The code renders 5 skeletons
        const skeletons = container.querySelectorAll('div[style*="animation: skeleton-pulse"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('calls onBack when back button is clicked', () => {
        render(
            <FacilityMobileView
                facilities={mockFacilities}
                playerFacilities={mockPlayerFacilities}
                loading={false}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )

        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[0])

        expect(mockOnBack).toHaveBeenCalled()
    })

    it('opens detail modal when clicking a normal facility', () => {
        render(
            <FacilityMobileView
                facilities={mockFacilities}
                playerFacilities={mockPlayerFacilities}
                loading={false}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )

        fireEvent.click(screen.getByText('약초 농장'))
        expect(screen.getByTestId('facility-detail-modal')).toBeInTheDocument()
    })

    it('opens dispatch modal when clicking dispatch facility', () => {
        render(
            <FacilityMobileView
                facilities={mockFacilities}
                playerFacilities={mockPlayerFacilities}
                loading={false}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )

        fireEvent.click(screen.getByText('파견'))
        expect(screen.getByTestId('dispatch-main-modal')).toBeInTheDocument()
    })

    it('calls upgrade function from detail modal', () => {
        render(
            <FacilityMobileView
                facilities={mockFacilities}
                playerFacilities={mockPlayerFacilities}
                loading={false}
                upgradeFacility={mockUpgradeFacility}
                onBack={mockOnBack}
            />
        )

        // Open modal
        fireEvent.click(screen.getByText('약초 농장'))

        // Find upgrade button in mock modal
        fireEvent.click(screen.getByText('Upgrade'))

        expect(mockUpgradeFacility).toHaveBeenCalledWith('herb_farm', { gold: 100 })
    })
})
