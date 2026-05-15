import { getUserProfile, getUserStats, updateUserProfileName, getUser, requireAuth, toDate } from '../api/api.js';
requireAuth();

const formatAsCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(a);
const formatMemberSince = (dateVal) => {
  if (!dateVal) return 'Member since recently';
  const d = toDate(dateVal);
  return `Member since ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
};

async function loadProfile() {
  try {
    const [profile, stats] = await Promise.all([getUserProfile(), getUserStats()]);
    if (profile) {
      document.getElementById('profile-avatar-img').src = profile.avatarUrl || 'https://robohash.org/default';
      document.getElementById('profile-name').textContent    = profile.name;
      document.getElementById('profile-email').textContent   = profile.email;
      document.getElementById('member-since').textContent    = formatMemberSince(profile.createdAt);
      document.getElementById('full-name').value = profile.name;
      document.getElementById('email').value     = profile.email;
    }
    if (stats) {
      document.getElementById('stat-transactions').textContent = stats.totalTransactions;
      document.getElementById('stat-income').textContent       = formatAsCurrency(stats.totalIncome);
      document.getElementById('stat-expenses').textContent     = formatAsCurrency(stats.totalExpenses);
    }
  } catch (err) { console.error('Profile load error:', err); alert('Could not load profile data.'); }
}

const personalInfoForm = document.getElementById('personal-info-form');
personalInfoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newName = document.getElementById('full-name').value.trim();
  if (!newName) { alert('Name cannot be empty.'); return; }
  if (!/^[a-zA-Z\s'-]{2,}$/.test(newName)) { alert('Please enter a valid name.'); return; }
  try {
    await updateUserProfileName(newName);
    document.getElementById('profile-name').textContent = newName;
    alert('Profile updated successfully!');
  } catch (err) { console.error(err); alert('Failed to update profile.'); }
});

document.getElementById('upload-avatar-btn').addEventListener('click', () => alert('Avatar upload feature is coming soon!'));
document.getElementById('email-notifications-toggle').addEventListener('change', (e) => { e.preventDefault(); e.target.checked = !e.target.checked; alert('Preference settings are coming soon!'); });
document.getElementById('budget-alerts-toggle').addEventListener('change', (e) => { e.preventDefault(); e.target.checked = !e.target.checked; alert('Preference settings are coming soon!'); });
document.getElementById('monthly-reports-toggle').addEventListener('change', (e) => { e.preventDefault(); e.target.checked = !e.target.checked; alert('Preference settings are coming soon!'); });

loadProfile();
