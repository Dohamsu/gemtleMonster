export default function FreeFormCauldron() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            overflow: 'auto',
            boxSizing: 'border-box',
            minHeight: 0
        }}>
            {/* Available Materials (읽기 전용) - 제거됨 (InventoryPanel과 중복) */}
        </div>
    )
}
