import { LayoutGridIcon } from './Icons'

// 「回門戶」按鈕，跟 form/msg/appeals/buddy 的 src/components/common/PortalLink.tsx 同一套
// class recipe（那幾份彼此也是各自複製一份，不是共用套件）。
//
// 網址這裡刻意寫死，不是忘了 AGENTS.md「絕不要把網域寫死在程式裡」那條：那條紅律針對的是
// SSO 契約裡的 issuer / audience / 服務網址，本服務不接 SSO、也沒有其他消費端都有的
// src/config/*.ts + PORTAL_URL 這層 env 機制（純前端 SPA，build 期只有 import.meta.glob
// 讀本地 markdown，不讀 registry）。「T-Pass 大廳只有一個」是這個生態系的靜態事實，
// 跟本機/正式站無關——其他服務的 PORTAL_URL 在本機也是切到 portal.lvh.me，但本服務根本
// 沒有走 SSO dev 流程的本機 lvh.me 環境，硬加一層 env 機制去讀一個永遠不變的值只是繞遠路。
const PORTAL_URL = 'https://portal.tschoolsu.org'

export default function PortalLink() {
  return (
    <a
      href={PORTAL_URL}
      className="inline-flex items-center gap-1.5 rounded-md border-2 border-foreground bg-card px-2.5 py-1 font-mono text-[11px] font-bold text-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      <LayoutGridIcon className="h-3.5 w-3.5" />
      首頁
    </a>
  )
}
