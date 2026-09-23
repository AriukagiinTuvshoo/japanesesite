# Nihongo JLPT

Монгол, English, 日本語 интерфэйстэй JLPT судлах PWA. Энэ хувилбар Next.js App Router, TypeScript, Tailwind, Supabase Auth/Postgres ашиглана.

## Локал хөгжүүлэлт

1. Node.js 24 болон Supabase CLI суулгана.
2. `npm ci`
3. Supabase project үүсгээд `.env.example`-ийг хуулж `.env.local` болгон, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` утгаа оруулна.
4. `npx supabase link --project-ref <project-ref>`
5. `npx supabase db push` — эхлээд fresh project дээр хэрэглэнэ.
6. `npm run dev`

Supabase Auth дээр имэйл баталгаажуулах болон зөв redirect URL-үүдийг тохируулна. Нэвтрэлтийн route abuse хамгаалалтад Upstash Redis-ийн `UPSTASH_REDIS_REST_URL` болон `UPSTASH_REDIS_REST_TOKEN` тохируулна. Production орчинд эдгээр тохиргоо дутвал нэвтрэлт хаагдана.

`SUPABASE_SERVICE_ROLE_KEY`-ийг клиентэд бүү оруул; энэ аппын client env шаардлагагүй. Admin эрхийг Auth user үүссэний дараа зөвхөн итгэмжлэгдсэн сервер/SQL администратор өгнө. `public.users.role` нь клиентээс шинэчлэгдэх боломжгүй.

## Шалгах командууд

- `npm run lint`
- `npm run type-check`
- `npm test -- --ci`
- `npm run build`

GitHub Actions эдгээр шалгалтыг PR бүр дээр ажиллуулна.

## Өгөгдлийн сан ба аюулгүй байдал

`supabase/migrations/` дахь эхний schema болон дараах hardening migration-уудыг дарааллаар ажиллуулна. Шинэ migration нь auth хэрэглэгч үүсгэх trigger, profile/role RLS, admin хамгаалалт, quiz хариултын түлхүүрийг нуух, сервер талын quiz grading зэргийг тохируулна. Одоогоор Supabase project холбоогүй учраас migration-ийг remote DB дээр хэрэгжүүлээгүй.

## Контент ба JLPT мэдэгдэл

N5–N1 тэмдэглэгээ нь суралцах чиглүүлэгч бөгөөд JLPT албан ёсны syllabus, асуулт, баталгаат жагсаалтыг хуулбарлахгүй. Одоогийн өгөгдлийн багцад хязгаарлагдмал эх контент орсон; түвшин бүрийн бүрэн үгийн сан, дүрэм, сонсгол, уншлагын контент нэмэхээс өмнө лиценз болон Монгол орчуулгыг редактороор хянуулна. Энэ апп нь албан бус жишиг сургалтын материал болно.

## Байршуулалт

Vercel дээр Next.js app болгон байршуулна. GitHub Pages нь энэ backend-тэй хувилбарт тохирохгүй. Production deploy-оос өмнө Supabase migrations, Auth redirect URL, Upstash хувьсагч, аппын домэйныг тохируулна.
