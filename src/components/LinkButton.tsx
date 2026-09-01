import type { AnchorHTMLAttributes } from 'react'

/**
 * tpass-ui 的 Button 只能渲染成 <button>（不是 polymorphic），但站內導覽
 * （例如「回首頁」）需要語意正確的 <a>。這裡照搬 Button primary 變體的
 * class 組合；tpass-ui/src/primitives.tsx 的 BTN_BASE / BTN_SHADOW 改了
 * 記得同步。
 */
export default function LinkButton({ className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-primary px-4 py-2 font-bold text-primary-foreground shadow-[3px_3px_0_0_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-foreground)] ${className}`}
      {...props}
    />
  )
}
