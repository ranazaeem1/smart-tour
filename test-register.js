const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvugzgnorizyxwchper.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnVnemdub3Jpenl4d2NocGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTE5MzksImV4cCI6MjA5MjQyNzkzOX0.xDRc3Tzduoyj7mh4tmiCgE4Is9Eh2WrxwzbOM4yaSrg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  
  console.log("Registering...", email);
  const { data: regData, error: regErr } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
    options: { data: { full_name: 'Test', role: 'user' } }
  });
  
  console.log("Registration:", regErr || (regData.session ? "Auto-logged in (no email confirm needed)" : "Needs email confirm (session null)"));
  
  if (!regData.session) {
      console.log("Trying to log in anyway...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123',
      });
      console.log('Login result:', error ? error.message : "Success");
  }
}

testAuth();
