const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvugzgnorizyxwchper.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnVnemdub3Jpenl4d2NocGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTE5MzksImV4cCI6MjA5MjQyNzkzOX0.xDRc3Tzduoyj7mh4tmiCgE4Is9Eh2WrxwzbOM4yaSrg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  });
  console.log('Login result:', { data, error });
}

testLogin();
