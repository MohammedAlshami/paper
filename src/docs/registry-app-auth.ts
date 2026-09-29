import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}. Inline styles cannot read CSS variables, so pass a value.`, "'#ec4899'");
const cls = (on = 'the form') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];
const CATEGORY = 'Authentication and account';

const entry = (e: Omit<ComponentEntry, 'status' | 'file' | 'category'> & { file: string }): ComponentEntry => ({ status: 'new', category: CATEGORY, ...e, file: `components/app/${e.file}.tsx` });

export const APP_AUTH_COMPONENTS: ComponentEntry[] = [
  entry({
    id: 'auth-card',
    name: 'AuthCard',
    tagline: 'The frame every sign-in page shares.',
    description: 'A title, a description, your form and some small print, as one centred card or as a split page with a brand panel beside it. The panel hides on a phone, so the form is always first.',
    file: 'auth-card',
    primitives: ['card'],
    deps: [],
    wide: true,
    usage: `<AuthCard
  variant="split"
  brand={<Logo />}
  title="Welcome back"
  description="Sign in to see your fleet."
  footer="By continuing you agree to the terms."
  aside={<blockquote>“Maintenance used to live in a spreadsheet.”</blockquote>}
>
  <LoginForm onSubmit={signIn} />
</AuthCard>`,
    anatomy: `import { AuthCard } from '@/components/app/auth-card';

// variant="card": one centred card, max 24rem wide.
// variant="split": the form on the left, \`aside\` on the right from the md breakpoint up.
// children is the form. Put your logo in \`brand\`, legal text in \`footer\`.
<AuthCard title={...} description={...} brand={...} footer={...} aside={...}>
  {form}
</AuthCard>`,
    examples: [{ label: 'A centred card', code: `<AuthCard title="Reset your password" description="We will email you a link.">\n  <ForgotPasswordForm onSubmit={sendLink} />\n</AuthCard>` }],
    api: [{ title: 'AuthCard', description: 'A card for one sign-in step.', rows: [row('variant', "'card' | 'split'", 'A single card, or a form beside a brand panel.', "'card'"), row('brand', 'ReactNode', 'Logo or name above the title.'), row('title', 'ReactNode', 'The page heading.'), row('description', 'ReactNode', 'One line under the heading.'), row('children', 'ReactNode', 'The form.'), row('footer', 'ReactNode', 'Small print under the form.'), row('aside', 'ReactNode', 'Content of the brand panel. Only the split variant shows it, and only from md up.'), accent('the panel wash'), cls('the card')] }],
  }),
  entry({
    id: 'login-form',
    name: 'LoginForm',
    tagline: 'Email, password, and the ways around them.',
    description: 'Email and password with show and hide, a remember-me box and a forgot link, plus optional social buttons. Errors show after a field is left and on submit. Signing in is yours: handle onSubmit, and pass error when it fails.',
    file: 'login-form',
    primitives: ['button', 'checkbox', 'input', 'label'],
    deps: icons,
    usage: `<LoginForm
  providers={[{ id: 'google', label: 'Google' }, { id: 'github', label: 'GitHub' }]}
  onSubmit={({ email, password, remember }) => signIn(email, password, remember)}
  onProvider={(provider) => signInWith(provider.id)}
  forgotPasswordHref="/forgot-password"
  registerHref="/register"
  loading={pending}
  error={failure}
/>`,
    anatomy: `import { LoginForm, type LoginValues } from '@/components/app/login-form';

// onSubmit only fires when both fields are valid.
// forgotPasswordHref / onForgotPassword show the link; registerHref / onSwitchToRegister show the footer line.
<LoginForm onSubmit={(values: LoginValues) => {}} />`,
    examples: [
      { label: 'Signing in', code: `<LoginForm defaultValues={{ email: 'priya@northwind.example', password: 'hunter2hunter2' }} loading />` },
      { label: 'A failed sign-in', code: `<LoginForm defaultValues={{ email: 'priya@northwind.example' }} error="Wrong email or password." />` },
    ],
    api: [{ title: 'LoginForm', description: 'A sign-in form. Pure UI: no network.', rows: [row('defaultValues', 'Partial<LoginValues>', 'Starting email, password and remember.'), row('providers', 'AuthProvider[]', 'id, label and an optional icon for each social button.', '[]'), row('onSubmit', '(values: LoginValues) => void', 'Called with valid values.'), row('onProvider', '(provider) => void', 'Called when a social button is pressed.'), row('onForgotPassword', '() => void', 'Handles the forgot link. Without it the link uses forgotPasswordHref.'), row('forgotPasswordHref', 'string', 'Shows the forgot link.'), row('onSwitchToRegister', '() => void', 'Handles the "Create one" link.'), row('registerHref', 'string', 'Shows the "Create one" link.'), row('loading', 'boolean', 'Disables the form and spins the button.', 'false'), row('error', 'string', 'A failure message shown above the fields.'), row('submitLabel', 'string', 'Button text.', "'Sign in'"), cls()] }],
  }),
  entry({
    id: 'register-form',
    name: 'RegisterForm',
    tagline: 'A sign-up form that tells you how strong the password is.',
    description: 'Name, work email and a password with a four-step strength meter, plus a terms box. extraFields adds your own inputs, such as a company name. Creating the account is yours.',
    file: 'register-form',
    primitives: ['button', 'checkbox', 'input', 'label'],
    deps: icons,
    usage: `<RegisterForm
  extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind Logistics', required: true }]}
  termsLabel={<>I agree to the <a href="/terms">terms</a></>}
  onSubmit={({ name, email, password, extra }) => createAccount(name, email, password, extra.company)}
  loginHref="/login"
/>`,
    anatomy: `import { RegisterForm, passwordStrength, type RegisterValues } from '@/components/app/register-form';

// Strength is 0 to 4. Under 8 characters is 0 and blocks submit; the other points are mixed case, a digit,
// a symbol and 12+ characters. passwordStrength(password) is exported if you want the number.
<RegisterForm onSubmit={(values: RegisterValues) => {}} />`,
    examples: [{ label: 'With a company field', code: `<RegisterForm extraFields={[{ id: 'company', label: 'Company', required: true }]} />` }],
    api: [{ title: 'RegisterForm', description: 'A sign-up form. Pure UI: no network.', rows: [row('defaultValues', 'Partial<RegisterValues>', 'Starting values.'), row('extraFields', 'ExtraField[]', 'id, label, placeholder, type and required for each added input. Answers come back in values.extra.', '[]'), row('termsLabel', 'ReactNode', 'Text beside the terms checkbox.'), row('onSubmit', '(values: RegisterValues) => void', 'Called with valid values.'), row('onSwitchToLogin', '() => void', 'Handles the "Sign in" link.'), row('loginHref', 'string', 'Shows the "Sign in" link.'), row('loading', 'boolean', 'Disables the form.', 'false'), row('error', 'string', 'A failure message shown above the fields.'), row('submitLabel', 'string', 'Button text.', "'Create account'"), accent('a weak password in the meter'), cls()] }],
  }),
  entry({
    id: 'forgot-password-form',
    name: 'ForgotPasswordForm',
    tagline: 'Ask for an email, then say the link is on its way.',
    description: 'One field, then a confirmation that does not reveal whether the address has an account. It swaps to the confirmation when onSubmit resolves; if it throws, the message is shown and the form stays.',
    file: 'forgot-password-form',
    primitives: ['button', 'input', 'label'],
    deps: icons,
    usage: `<ForgotPasswordForm
  onSubmit={async (email) => {
    await api.sendResetLink(email);
  }}
  backHref="/login"
/>`,
    anatomy: `import { ForgotPasswordForm } from '@/components/app/forgot-password-form';

// onSubmit may be async. Resolve to show "check your inbox"; throw an Error to show its message.
// The confirmation has a "Send it again" button that calls onSubmit again.
<ForgotPasswordForm onSubmit={sendLink} onBack={() => navigate('/login')} />`,
    examples: [{ label: 'Already sent', code: `<ForgotPasswordForm defaultEmail="priya@northwind.example" defaultSent backHref="/login" />` }],
    api: [{ title: 'ForgotPasswordForm', description: 'Request a reset link.', rows: [row('defaultEmail', 'string', 'Starting email.', "''"), row('defaultSent', 'boolean', 'Start on the confirmation.', 'false'), row('onSubmit', '(email: string) => void | Promise<void>', 'Sends the link. Throw to show an error.'), row('onBack', '() => void', 'Handles "Back to sign in".'), row('backHref', 'string', 'Shows "Back to sign in" as a link.'), cls()] }],
  }),
  entry({
    id: 'verify-code-form',
    name: 'VerifyCodeForm',
    tagline: 'A one-time code in boxes that behave.',
    description: 'Separate digit boxes: typing advances, backspace steps back, the arrow keys move, and pasting a code fills them all. onComplete fires on the last digit. Resend is locked behind a countdown.',
    file: 'verify-code-form',
    primitives: ['button'],
    deps: icons,
    usage: `<VerifyCodeForm
  destination="priya@northwind.example"
  onComplete={(code) => verify(code)}
  onResend={() => sendNewCode()}
  error={wrongCode ? 'That code is not right.' : undefined}
/>`,
    anatomy: `import { VerifyCodeForm } from '@/components/app/verify-code-form';

// length is 6 by default. autoComplete="one-time-code" is set on the first box so phones offer the SMS code.
// A wrong code is yours to detect: pass \`error\` and the boxes turn to the accent colour.
<VerifyCodeForm length={6} onComplete={(code) => {}} />`,
    examples: [{ label: 'Four digits, no countdown', code: `<VerifyCodeForm length={4} resendSeconds={0} />` }],
    api: [{ title: 'VerifyCodeForm', description: 'A one-time code entry.', rows: [row('length', 'number', 'Number of boxes.', '6'), row('onComplete', '(code: string) => void', 'Fires when the last box is filled, and when Verify is pressed.'), row('onResend', '() => void', 'Called when Resend is pressed. The boxes clear and the countdown restarts.'), row('resendSeconds', 'number', 'Seconds before Resend unlocks. 0 unlocks it at once.', '30'), row('destination', 'string', 'Where the code was sent, shown in the intro line.'), row('loading', 'boolean', 'Disables the boxes and spins the button.', 'false'), row('error', 'string', 'A failure message. Turns the boxes to the accent colour.'), accent('the error state'), cls()] }],
  }),
  entry({
    id: 'profile-form',
    name: 'ProfileForm',
    tagline: 'Account details that know when they have changed.',
    description: 'A photo, name, email, role and bio. Save and Cancel stay off until something changes, Cancel restores the last saved values, and a chosen photo is previewed at once. Uploading it is yours.',
    file: 'profile-form',
    primitives: ['avatar', 'button', 'card', 'input', 'label', 'select', 'textarea'],
    deps: icons,
    usage: `<ProfileForm
  defaultValues={{ name: 'Priya Nair', email: 'priya@northwind.example', role: 'Fleet manager', bio: '' }}
  roles={['Fleet manager', 'Workshop lead', 'Technician']}
  onSave={(values) => api.updateProfile(values)}
  onAvatarChange={(file) => api.uploadAvatar(file)}
/>`,
    anatomy: `import { ProfileForm, type ProfileValues } from '@/components/app/profile-form';

// "Saved" is whatever onSave last received; dirty compares the fields to it.
// Leave \`roles\` out to make the role a free text field.
<ProfileForm defaultValues={values} onSave={(next: ProfileValues) => {}} />`,
    examples: [{ label: 'Free-text role', code: `<ProfileForm defaultValues={{ name: 'Sam Okafor', email: 'sam@northwind.example', role: 'Driver', bio: '' }} />` }],
    api: [{ title: 'ProfileForm', description: 'An editable profile.', rows: [row('defaultValues', 'ProfileValues', 'name, email, role, bio and an optional avatarUrl.'), row('roles', 'string[]', 'Options for a role select. Without it the role is a text input.'), row('bioLimit', 'number', 'Maximum bio length.', '200'), row('onSave', '(values: ProfileValues) => void', 'Called with valid, changed values.'), row('onAvatarChange', '(file: File) => void', 'Receives the picked image.'), row('saving', 'boolean', 'Disables the buttons and spins Save.', 'false'), cls('the card')] }],
  }),
  entry({
    id: 'notification-preferences',
    name: 'NotificationPreferences',
    tagline: 'What to be told about, and where.',
    description: 'Rows grouped by topic, with one switch per channel. The value is a flat record keyed itemId.channelId. On a phone the channel names move into each row so the columns still read.',
    file: 'notification-preferences',
    primitives: ['card', 'switch'],
    deps: [],
    usage: `<NotificationPreferences
  channels={[{ id: 'email', label: 'Email' }, { id: 'push', label: 'Push' }]}
  groups={[{ id: 'work', title: 'Work', items: [{ id: 'assigned', label: 'A work order is assigned to me' }] }]}
  defaultValue={{ 'assigned.email': true }}
  onChange={(value) => api.savePreferences(value)}
/>`,
    anatomy: `import { NotificationPreferences, preferenceKey } from '@/components/app/notification-preferences';

// value['assigned.email'] === true. preferenceKey('assigned', 'email') builds the key.
// onChange fires after every toggle with the whole record, so it suits an autosave.
<NotificationPreferences groups={groups} channels={channels} onChange={save} />`,
    examples: [{ label: 'One channel', code: `<NotificationPreferences channels={[{ id: 'email', label: 'Email' }]} groups={groups} />` }],
    api: [{ title: 'NotificationPreferences', description: 'A matrix of switches.', rows: [row('groups', 'NotificationGroup[]', 'id, title and items (id, label, description) for each topic.'), row('channels', 'NotificationChannel[]', 'id and label for each column.'), row('defaultValue', 'Record<string, boolean>', 'Which switches start on.', '{}'), row('onChange', '(value: Record<string, boolean>) => void', 'Called after every toggle.'), cls('the card')] }],
  }),
];
