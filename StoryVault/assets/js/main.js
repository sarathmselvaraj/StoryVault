/* ==========================================================================
   StoryVault - Bookshop & Lending Library Multipurpose HTML Template
   Main JavaScript - ES6 Interactive Core, Role Access & LocalStorage Data Engine
   ========================================================================== */

/* ==========================================================================
   SECURITY DISCLAIMER FOR STATIC TEMPLATE:
   Client-side localStorage/sessionStorage role protection is strictly for 
   demonstrating frontend UX functionality in an HTML/CSS/JS template.
   For real commercial production applications, replace this demo logic with 
   secure backend authentication APIs (Firebase, Supabase, Node.js, Laravel, 
   PHP, etc.) enforcing server-side token/session authorization.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. Storage Keys Setup
    const STORAGE_KEYS = {
        THEME: 'storyvault_theme',
        RTL: 'storyvault_rtl',
        WISHLIST: 'storyvault_wishlist',
        BORROW_REQUESTS: 'storyvault_borrow_requests',
        BORROWED_BOOKS: 'storyvault_borrowed',
        USER: 'storyvault_user',
        BOOKS_CATALOG: 'storyvault_books',
        REGISTERED_USERS: 'storyvault_registered_users'
    };

    // Initialize Default User Session if empty (default to guest unless logged in)
    window.getCurrentUser = () => {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        return raw ? JSON.parse(raw) : null;
    };

    window.setCurrentUser = (userObj) => {
        const persistentUser = { ...userObj, signedInAt: userObj.signedInAt || new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(persistentUser));
    };

    window.logoutUser = () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        showToast('Logged Out', 'You have been logged out of your session.', 'info');
        setTimeout(() => {
            window.location.replace('login.html');
        }, 1000);
    };


    const getPortalUrlForUser = (user) => user?.role === 'admin' ? 'admin-dashboard.html' : 'member-dashboard.html';

    // Keep the signed-in identity visible across every public page. The same
    // profile action lives inside the Bootstrap collapse, so it remains clear
    // and usable in hamburger/mobile navigation as well as desktop navigation.
    window.syncAuthenticatedNavigation = () => {
        const user = getCurrentUser();
        if (!user || !['member', 'admin'].includes(user.role)) return;

        const portalUrl = getPortalUrlForUser(user);
        const firstName = (user.name || 'My').trim().split(/\s+/)[0];
        const avatar = user.avatar || 'assets/images/team/team2.jpg';
        const profileLabel = user.role === 'admin' ? 'Admin Profile' : 'My Profile';

        document.querySelectorAll('.main-navbar .nav-actions a[href="login.html"]').forEach((link) => {
            const profile = document.createElement('a');
            profile.href = portalUrl;
            profile.className = 'nav-profile-btn ms-lg-1';
            profile.setAttribute('aria-label', `${profileLabel}: ${user.name || firstName}`);
            profile.innerHTML = `
                <img class="nav-profile-avatar" src="${avatar}" alt="${user.name || 'Profile'}">
                <span class="nav-profile-copy"><small>${profileLabel}</small><strong>${firstName}</strong></span>
                <i class="fa-solid fa-chevron-right nav-profile-arrow"></i>`;
            link.replaceWith(profile);
        });

        // Mobile uses a compact top-row avatar so the hamburger header keeps the
        // same clean alignment as the reference instead of hiding identity below.
        document.querySelectorAll('.main-navbar .navbar').forEach((navbar) => {
            if (navbar.querySelector('.mobile-profile-quick')) return;
            const toggler = navbar.querySelector('.navbar-toggler');
            if (!toggler) return;
            const quickProfile = document.createElement('a');
            quickProfile.href = portalUrl;
            quickProfile.className = 'mobile-profile-quick';
            quickProfile.setAttribute('aria-label', `${profileLabel}: ${user.name || firstName}`);
            quickProfile.title = `${profileLabel}: ${user.name || firstName}`;
            quickProfile.innerHTML = `<img src="${avatar}" alt="${user.name || 'Profile'}">`;
            navbar.insertBefore(quickProfile, toggler);
        });

        // Footer sign-in shortcuts should lead back to the active portal rather
        // than reopening authentication for a user who is already signed in.
        document.querySelectorAll('.footer-main a[href="login.html"]').forEach((link) => {
            link.href = portalUrl;
            if (/member sign in|admin sign in/i.test(link.textContent || '')) {
                link.innerHTML = `<i class="fa-solid fa-user-circle me-1"></i> Open ${user.role === 'admin' ? 'Admin Dashboard' : 'Member Portal'}`;
            }
        });
    };

    syncAuthenticatedNavigation();

    // 2. Portal Access Protection (front-end template demonstration)
    window.protectPortalAccess = () => {
        const currentUser = getCurrentUser();
        const path = window.location.pathname;
        const requiredRole = path.includes('admin-dashboard.html') ? 'admin' :
                             path.includes('member-dashboard.html') ? 'member' : null;

        if (requiredRole && (!currentUser || currentUser.role !== requiredRole)) {
            const portalName = requiredRole === 'admin' ? 'Admin Dashboard' : 'Member Portal';
            const overlay = document.createElement('div');
            overlay.className = 'access-denied-overlay';
            overlay.innerHTML = `
                <div class="access-denied-card">
                    <i class="fa-solid fa-lock access-denied-icon"></i>
                    <h2>Sign In Required</h2>
                    <p>You need valid ${requiredRole} credentials to access the ${portalName}.</p>
                    <a href="login.html" class="btn btn-story btn-story-primary">Go to Secure Sign In</a>
                </div>`;
            document.body.appendChild(overlay);
            setTimeout(() => { window.location.href = 'login.html'; }, 1800);
            return false;
        }
        return true;
    };

    protectPortalAccess();

    // 3. Functional Demo Authentication
    const DEMO_ACCOUNTS = {
        admin: {
            email: 'admin@storyvault.org',
            password: 'Admin@123',
            user: {
                name: 'Meera Krishnan',
                email: 'admin@storyvault.org',
                role: 'admin',
                avatar: 'assets/images/team/team1.jpg',
                title: 'Head Curator & Administrator'
            }
        },
        member: {
            email: 'member@storyvault.org',
            password: 'Member@123',
            user: {
                name: 'Arjun Nair',
                email: 'member@storyvault.org',
                role: 'member',
                plan: 'Explorer Member',
                avatar: 'assets/images/team/team2.jpg'
            }
        }
    };

    window.togglePasswordVisibility = (inputId, button) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        if (button) button.textContent = showing ? 'Show' : 'Hide';
    };

    // Premium button-based portal selector used on the sign-in page.
    window.setLoginRole = (role) => {
        if (!['member', 'admin'].includes(role)) return;
        const roleInput = document.getElementById('loginRoleSelect');
        const memberBtn = document.getElementById('memberLoginBtn');
        const adminBtn = document.getElementById('adminLoginBtn');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const errorBox = document.getElementById('loginError');

        if (roleInput) roleInput.value = role;
        memberBtn?.classList.toggle('active', role === 'member');
        adminBtn?.classList.toggle('active', role === 'admin');
        memberBtn?.setAttribute('aria-pressed', role === 'member' ? 'true' : 'false');
        adminBtn?.setAttribute('aria-pressed', role === 'admin' ? 'true' : 'false');

        emailInput?.classList.remove('is-invalid');
        passwordInput?.classList.remove('is-invalid');
        if (errorBox) errorBox.style.display = '';
    };

    // Static-template social sign-in demo. In production, replace this with the
    // provider's OAuth callback and server-side token verification. Social
    // authentication intentionally opens the Member Portal only.
    window.handleSocialLogin = (provider) => {
        const providers = {
            google: { name: 'Google Member', email: 'google.member@storyvault.local' },
            instagram: { name: 'Instagram Member', email: 'instagram.member@storyvault.local' }
        };
        const account = providers[provider];
        if (!account) return;

        setLoginRole('member');
        const socialUser = {
            name: account.name,
            email: account.email,
            role: 'member',
            plan: 'Explorer Member',
            avatar: 'assets/images/team/team2.jpg',
            provider
        };
        setCurrentUser(socialUser);
        syncAuthenticatedNavigation();
        const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
        showToast('Signed In', `${providerLabel} sign in successful. Opening your member portal...`, 'success');
        setTimeout(() => { window.location.href = 'member-dashboard.html'; }, 650);
    };

    window.handlePortalLogin = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const role = document.getElementById('loginRoleSelect')?.value || 'member';
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const errorBox = document.getElementById('loginError');
        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        let authenticatedUser = null;
        const demo = DEMO_ACCOUNTS[role];
        if (demo && email === demo.email && password === demo.password) {
            authenticatedUser = demo.user;
        }

        if (!authenticatedUser && role === 'member') {
            const registered = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS) || '[]');
            const match = registered.find(u => u.email.toLowerCase() === email && u.password === password);
            if (match) {
                authenticatedUser = {
                    name: match.name,
                    email: match.email,
                    role: 'member',
                    plan: 'Explorer Member',
                    avatar: 'assets/images/team/team2.jpg'
                };
            }
        }

        if (!authenticatedUser) {
            emailInput?.classList.add('is-invalid');
            passwordInput?.classList.add('is-invalid');
            if (errorBox) errorBox.style.display = 'block';
            showToast('Sign In Failed', 'Check the email, password, and selected portal.', 'danger');
            return;
        }

        emailInput?.classList.remove('is-invalid');
        passwordInput?.classList.remove('is-invalid');
        setCurrentUser(authenticatedUser);
        syncAuthenticatedNavigation();
        showToast('Signed In', `Welcome ${authenticatedUser.name}. Opening your portal...`, 'success');
        setTimeout(() => {
            window.location.href = authenticatedUser.role === 'admin' ? 'admin-dashboard.html' : 'member-dashboard.html';
        }, 650);
    };

    window.registerMember = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value;
        const phone = document.getElementById('registerPhone').value.trim();
        const registered = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS) || '[]');

        if (registered.some(u => u.email.toLowerCase() === email) || email === DEMO_ACCOUNTS.member.email || email === DEMO_ACCOUNTS.admin.email) {
            showToast('Account Exists', 'An account with this email already exists. Please sign in.', 'warning');
            return;
        }

        registered.push({ name, email, password, phone, createdAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registered));
        const memberUser = { name, email, role: 'member', plan: 'Explorer Member', avatar: 'assets/images/team/team2.jpg' };
        setCurrentUser(memberUser);
        syncAuthenticatedNavigation();
        showToast('Account Created', 'Your member account is ready. Opening your portal...', 'success');
        setTimeout(() => { window.location.href = 'member-dashboard.html'; }, 700);
    };

    // Personalize member portal with the signed-in account
    const memberNameEl = document.getElementById('memberDisplayName');
    const memberWelcomeEl = document.getElementById('memberWelcomeName');
    if (memberNameEl || memberWelcomeEl) {
        const currentUser = getCurrentUser();
        if (currentUser?.role === 'member') {
            if (memberNameEl) memberNameEl.textContent = currentUser.name;
            if (memberWelcomeEl) memberWelcomeEl.textContent = currentUser.name.split(' ')[0];
        }
    }


    // Member Portal mobile drawer: overlay menu with explicit Close-only dismissal.
    // While open, the dashboard beneath it is frozen so accidental background
    // scrolling/taps cannot occur on 320/360px devices.
    const initMemberMobileDrawer = () => {
        const body = document.body;
        const sidebar = document.getElementById('memberSidebar');
        if (!body?.classList.contains('member-portal-page') || !sidebar) return;

        const openButtons = Array.from(document.querySelectorAll('[data-member-drawer-open="true"]'));
        const closeButton = sidebar.querySelector('[data-member-drawer-close="true"]');
        let opener = null;

        const setExpanded = (expanded) => {
            openButtons.forEach(btn => btn.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
            sidebar.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        };

        const openDrawer = (button) => {
            if (window.matchMedia('(min-width: 992px)').matches) return;
            opener = button || document.activeElement;
            body.classList.add('dashboard-drawer-open');
            setExpanded(true);
            window.setTimeout(() => closeButton?.focus({ preventScroll: true }), 80);
        };

        const closeDrawer = () => {
            body.classList.remove('dashboard-drawer-open');
            setExpanded(false);
            if (opener && typeof opener.focus === 'function') {
                window.setTimeout(() => opener.focus({ preventScroll: true }), 40);
            }
        };

        openButtons.forEach(btn => btn.addEventListener('click', (event) => {
            event.preventDefault();
            openDrawer(btn);
        }));
        closeButton?.addEventListener('click', (event) => {
            event.preventDefault();
            closeDrawer();
        });

        // Keep outside/backdrop clicks inert: only the visible close control dismisses.
        document.querySelector('.member-drawer-backdrop')?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        // Prevent focus from escaping behind the drawer when keyboard navigation is used.
        sidebar.addEventListener('keydown', (event) => {
            if (event.key !== 'Tab' || !body.classList.contains('dashboard-drawer-open')) return;
            const focusable = Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter(el => el.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        });

        const desktopQuery = window.matchMedia('(min-width: 992px)');
        const resetForDesktop = () => {
            if (desktopQuery.matches) {
                body.classList.remove('dashboard-drawer-open');
                openButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
                sidebar.removeAttribute('aria-hidden');
            } else if (!body.classList.contains('dashboard-drawer-open')) {
                setExpanded(false);
            }
        };
        desktopQuery.addEventListener?.('change', resetForDesktop);
        resetForDesktop();
    };

    initMemberMobileDrawer();

    // 4. Master 10 StoryVault Books Data Collection
    const STORYVAULT_BOOKS = [
        {
            id: 'b1',
            title: 'The Quiet Archive',
            author: 'Clara Vance',
            genre: 'Mystery',
            genreLabel: 'Mystery / Drama',
            rating: 4.8,
            reviewsCount: 124,
            price: '₹599',
            priceVal: 599,
            availability: 'available',
            statusLabel: 'Available',
            stock: '4 Copies Left',
            copies: 4,
            cover: 'assets/images/books/book1.jpg',
            isbn: '978-0-321-7890',
            pages: 384,
            publisher: 'StoryVault Editions',
            format: 'Hardcover',
            summary: 'Set in a coastal library during the winter of 1924, The Quiet Archive uncovers forgotten manuscripts, whispered family secrets, and a cartographer\'s search for lost maps.',
            description: 'When librarian Eleanor Vance discovers a hidden alcove behind the archives, she finds a leather-bound journal dating back to 1924. Inside are handwritten coordinates leading to forgotten lighthouses across the storm-swept coastline. As she deciphers the cryptic entries, Eleanor realizes she isn\'t the only one seeking the archive\'s secrets...',
            authorBio: 'Clara Vance is an award-winning novelist and former archivist specializing in early 20th-century coastal history.'
        },
        {
            id: 'b2',
            title: 'Beyond the Lantern',
            author: 'Arthur Pendelton',
            genre: 'Historical Fiction',
            genreLabel: 'Historical Fiction',
            rating: 4.7,
            reviewsCount: 98,
            price: '₹549',
            priceVal: 549,
            availability: 'available',
            statusLabel: '1 Copy Left',
            stock: '1 Copy Left',
            copies: 1,
            cover: 'assets/images/books/book2.jpg',
            isbn: '978-0-452-1122',
            pages: 412,
            publisher: 'StoryVault Editions',
            format: 'Hardcover',
            summary: 'A haunting historical novel depicting a foggy Victorian city where an antique lantern maker uncovers a covert network of nocturnal scholars.',
            description: 'Along the cobblestone streets of 1895 Kolkata, lantern maker Arthur Pendelton constructs oil lamps that illuminate more than dark alleys. When a mysterious order commissions a set of brass lanterns etched with secret celestial ciphers, Arthur is drawn into a centuries-old guild guarding lost history.',
            authorBio: 'Arthur Pendelton is a historian and novelist known for his vivid recreations of 19th-century urban life.'
        },
        {
            id: 'b3',
            title: 'Letters from Winter',
            author: 'Evelyn Harper',
            genre: 'Romance',
            genreLabel: 'Romance',
            rating: 4.9,
            reviewsCount: 210,
            price: '₹499',
            priceVal: 499,
            availability: 'available',
            statusLabel: 'Available',
            stock: '5 Copies Left',
            copies: 5,
            cover: 'assets/images/books/book3.jpg',
            isbn: '978-0-143-9988',
            pages: 320,
            publisher: 'StoryVault Editions',
            format: 'Paperback / Hardcover',
            summary: 'An evocative romance told through preserved winter epistles exchanged across snowy landscapes, revealing a timeless love story.',
            description: 'Discovered inside a vintage desk purchased at a remote alpine auction, a ribbon-bound bundle of letters reveals the correspondence between two artists separated by the winter of 1942. As reader Hannah reads each line, she discovers echoes of the mystery in her own life.',
            authorBio: 'Evelyn Harper writes romantic fiction and poetry from her quiet cottage in Shimla.'
        },
        {
            id: 'b4',
            title: 'The Last Observatory',
            author: 'Dr. Julian Sterling',
            genre: 'Sci-Fi',
            genreLabel: 'Science Fiction / Astronomy',
            rating: 4.8,
            reviewsCount: 156,
            price: '₹699',
            priceVal: 699,
            availability: 'available',
            statusLabel: '3 Copies Left',
            stock: '3 Copies Left',
            copies: 3,
            cover: 'assets/images/books/book4.jpg',
            isbn: '978-0-743-4455',
            pages: 496,
            publisher: 'StoryVault Sci-Fi',
            format: 'Hardcover',
            summary: 'High atop an isolated mountain peak, astronomers at humanity\'s final deep-space telescope intercept a signal that changes the course of stellar exploration.',
            description: 'Perched 14,000 feet above sea level, the Mount Apex Observatory is slated for permanent decommission. On its final operational night, lead astrophysicist Dr. Julian Sterling detects a repeating harmonic frequency emanating from the Andromeda sector—a signal that carries mathematical proof of artificial origin.',
            authorBio: 'Dr. Julian Sterling holds a doctorate in astrophysics and has authored five acclaimed sci-fi epics.'
        },
        {
            id: 'b5',
            title: 'A Study in Rain',
            author: 'Soren Lindqvist',
            genre: 'Poetry',
            genreLabel: 'Poetry & Essays',
            rating: 4.6,
            reviewsCount: 84,
            price: '₹399',
            priceVal: 399,
            availability: 'available',
            statusLabel: 'Available',
            stock: '6 Copies Left',
            copies: 6,
            cover: 'assets/images/books/book5.jpg',
            isbn: '978-0-061-3321',
            pages: 192,
            publisher: 'StoryVault Press',
            format: 'Hardcover Collector\'s Edition',
            summary: 'A meditative poetry anthology celebrating rain-covered cobblestones, quiet city evenings, coffee-stained notebooks, and introspective solace.',
            description: 'Crafted over a decade in Scandinavian cafes and rain-washed coastal ports, A Study in Rain captures the quiet moments between storm and stillness. Each stanza explores solitude, memory, and the solace found in nature.',
            authorBio: 'Soren Lindqvist is a Nordic poet and essayist whose works have been translated into twelve languages.'
        },
        {
            id: 'b6',
            title: 'The Midnight Cartographer',
            author: 'Cassandra Vale',
            genre: 'Fantasy',
            genreLabel: 'Fantasy',
            rating: 4.9,
            reviewsCount: 178,
            price: '₹749',
            priceVal: 749,
            availability: 'available',
            statusLabel: '2 Copies Left',
            stock: '2 Copies Left',
            copies: 2,
            cover: 'assets/images/books/book6.jpg',
            isbn: '978-0-553-8877',
            pages: 528,
            publisher: 'StoryVault Mythos',
            format: 'Hardcover Special Edition',
            summary: 'When an apprentice mapmaker discovers a glowing celestial map hidden beneath an old draft table, she is drawn into a world where maps alter reality.',
            description: 'In the guild city of Oakhaven, cartography is forbidden after midnight. Young apprentice Cassandra Vale breaks the rule and discovers a parchment that redraws itself with glowing ley-lines whenever the moon reaches its zenith. To save her realm, she must chart lands that exist only in starlight.',
            authorBio: 'Cassandra Vale is a bestselling fantasy novelist known for intricate worldbuilding and magical realism.'
        },
        {
            id: 'b7',
            title: 'The Glass Garden',
            author: 'Flora Montgomery',
            genre: 'Contemporary Fiction',
            genreLabel: 'Contemporary Fiction',
            rating: 4.7,
            reviewsCount: 112,
            price: '₹579',
            priceVal: 579,
            availability: 'available',
            statusLabel: '4 Copies Left',
            stock: '4 Copies Left',
            copies: 4,
            cover: 'assets/images/books/book7.jpg',
            isbn: '978-0-307-5544',
            pages: 368,
            publisher: 'StoryVault Editions',
            format: 'Hardcover',
            summary: 'Inside a breathtaking Victorian glasshouse, three generations of women untangle family mysteries and tend to rare botanical specimens.',
            description: 'Inheriting a botanical heritage estate in the Nilgiris, botanist Flora Montgomery discovers an enclosed glass conservatory containing hybrid flora thought extinct since 1890. Bound inside the greenhouse walls are sealed journals detailing a family secret that reshapes her past.',
            authorBio: 'Flora Montgomery is a literary fiction writer and master gardener residing in the Nilgiris.'
        },
        {
            id: 'b8',
            title: 'Before the City Sleeps',
            author: 'Marcus Reed',
            genre: 'Mystery',
            genreLabel: 'Crime / Thriller',
            rating: 4.8,
            reviewsCount: 142,
            price: '₹629',
            priceVal: 629,
            availability: 'available',
            statusLabel: '3 Copies Left',
            stock: '3 Copies Left',
            copies: 3,
            cover: 'assets/images/books/book8.jpg',
            isbn: '978-0-385-6677',
            pages: 400,
            publisher: 'StoryVault Noir',
            format: 'Hardcover',
            summary: 'An atmospheric noir thriller following an insomniac investigator navigating rain-soaked alleys and shadow-draped city secrets.',
            description: 'Between 2:00 AM and 5:00 AM, the metropolis speaks a different language. Insomniac detective Marcus Reed tracks a series of cryptic messages left on wet telephone booths across downtown, unravelling an intricate conspiracy before dawn breaks.',
            authorBio: 'Marcus Reed is a former investigative reporter turned crime novelist.'
        },
        {
            id: 'b9',
            title: 'Where the Wild Stars Begin',
            author: 'Talia Rivers',
            genre: 'Adventure',
            genreLabel: 'Adventure / Exploration',
            rating: 4.9,
            reviewsCount: 190,
            price: '₹649',
            priceVal: 649,
            availability: 'available',
            statusLabel: '5 Copies Left',
            stock: '5 Copies Left',
            copies: 5,
            cover: 'assets/images/books/book9.jpg',
            isbn: '978-0-812-9900',
            pages: 448,
            publisher: 'StoryVault Expeditions',
            format: 'Hardcover',
            summary: 'An exhilarating alpine adventure about high-altitude explorers charting unexplored mountain passes beneath the luminous Milky Way.',
            description: 'Scaling the remote jagged peaks of the Karakoram range, mountaineer Talia Rivers and her expedition team embark on a quest to locate an ancient high-altitude monastery depicted in century-old cartographic sketches.',
            authorBio: 'Talia Rivers is an alpine climber and travel writer based in Manali.'
        },
        {
            id: 'b10',
            title: 'The House of Forgotten Hours',
            author: 'Gideon Thorne',
            genre: 'Mystery',
            genreLabel: 'Gothic Mystery',
            rating: 4.8,
            reviewsCount: 165,
            price: '₹699',
            priceVal: 699,
            availability: 'borrowed',
            statusLabel: 'On Reserve',
            stock: 'On Hold / Reserve',
            copies: 0,
            cover: 'assets/images/books/book10.jpg',
            isbn: '978-0-151-4433',
            pages: 464,
            publisher: 'StoryVault Classics',
            format: 'Hardcover Collector\'s Edition',
            summary: 'A chilling gothic mystery centered around an ancient manor at blue hour, a ticking pocket watch, and rooms that exist only between midnight and dawn.',
            description: 'When clockmaker Gideon Thorne is summoned to restore the astronomical grandfather clock at Blackwood Manor, he discovers that every hour struck on the clock reverses time inside the manor\'s north wing by precisely sixty minutes.',
            authorBio: 'Gideon Thorne is a master of gothic fiction and atmospheric horror.'
        }
    ];

    window.STORYVAULT_BOOKS = STORYVAULT_BOOKS;
    window.getBookById = (id) => STORYVAULT_BOOKS.find(b => b.id === id || b.id === 'b' + id) || STORYVAULT_BOOKS[0];

    // Seed local storage with complete catalog if empty or outdated
    if (!localStorage.getItem(STORAGE_KEYS.BOOKS_CATALOG)) {
        localStorage.setItem(STORAGE_KEYS.BOOKS_CATALOG, JSON.stringify(STORYVAULT_BOOKS));
    }

    // 5. Dynamic Book Details Page Renderer (book-details.html)
    const initBookDetailsPage = () => {
        const titleEl = document.getElementById('book-detail-title');
        if (!titleEl) return;

        const params = new URLSearchParams(window.location.search);
        let rawId = params.get('id') || 'b1';
        if (!rawId.startsWith('b') && !isNaN(rawId)) rawId = 'b' + rawId;
        const book = window.getBookById(rawId);

        // Update Document Title & Breadcrumb
        document.title = `${book.title} - Book Details | StoryVault`;
        const breadcrumbTitle = document.getElementById('book-breadcrumb-title');
        if (breadcrumbTitle) breadcrumbTitle.textContent = book.title;

        // Image & Badges
        const coverImg = document.getElementById('book-detail-cover');
        if (coverImg) {
            coverImg.src = book.cover;
            coverImg.alt = book.title;
        }

        const stockBadge = document.getElementById('book-detail-stock-badge');
        if (stockBadge) {
            stockBadge.className = book.availability === 'available' ? 'badge badge-glow' : 'badge bg-secondary';
            stockBadge.innerHTML = `<i class="fa-solid ${book.availability === 'available' ? 'fa-circle-check text-success' : 'fa-clock text-warning'} me-1"></i> ${book.stock}`;
        }

        const formatBadge = document.getElementById('book-detail-format-badge');
        if (formatBadge) formatBadge.textContent = book.format;

        // Info Header
        const genreEl = document.getElementById('book-detail-genre');
        if (genreEl) genreEl.textContent = book.genreLabel;

        titleEl.textContent = book.title;

        const authorEl = document.getElementById('book-detail-author');
        if (authorEl) authorEl.textContent = `By ${book.author}`;

        const ratingEl = document.getElementById('book-detail-rating');
        if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star text-warning me-1"></i> <strong>${book.rating}</strong> (${book.reviewsCount} reviews)`;

        const summaryEl = document.getElementById('book-detail-summary');
        if (summaryEl) summaryEl.textContent = book.summary;

        // Metadata Pills
        const publisherEl = document.getElementById('book-detail-publisher');
        if (publisherEl) publisherEl.textContent = book.publisher;

        const isbnEl = document.getElementById('book-detail-isbn');
        if (isbnEl) isbnEl.textContent = book.isbn;

        const pagesEl = document.getElementById('book-detail-pages');
        if (pagesEl) pagesEl.textContent = `${book.pages} pages`;

        const stockPillEl = document.getElementById('book-detail-stock-pill');
        if (stockPillEl) stockPillEl.textContent = book.stock;

        // Pricing & Action Buttons
        const priceEl = document.getElementById('book-detail-price');
        if (priceEl) priceEl.textContent = book.price;

        const borrowBtn = document.getElementById('book-detail-borrow-btn');
        if (borrowBtn) {
            borrowBtn.onclick = () => requestBorrow(book.title);
        }

        const buyBtn = document.getElementById('book-detail-buy-btn');
        if (buyBtn) {
            buyBtn.onclick = () => showToast('Added to Cart', `"${book.title}" hardcover edition added to your order!`, 'success');
        }

        const wishlistBtn = document.getElementById('book-detail-wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.setAttribute('data-book-id', book.id);
            wishlistBtn.onclick = () => toggleWishlist(book.id, book.title);
        }

        // Tab Content
        const descTabPane = document.getElementById('desc-pane');
        if (descTabPane) {
            descTabPane.innerHTML = `<p class="mb-3">${book.description}</p><p class="text-muted small">Part of the official StoryVault Curated Collection. Available for immediate digital reservation or library pickup.</p>`;
        }

        const authorTabPane = document.getElementById('author-pane');
        if (authorTabPane) {
            authorTabPane.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle bg-surface-alt d-flex align-items-center justify-content-center fw-bold fs-4 text-primary" style="width:70px; height:70px; min-width:70px;">
                        ${book.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h5 class="fw-bold mb-1">${book.author}</h5>
                        <p class="small text-muted mb-0">${book.authorBio}</p>
                    </div>
                </div>`;
        }

        // Render Related Books
        const relatedGrid = document.getElementById('related-books-grid');
        if (relatedGrid) {
            const related = STORYVAULT_BOOKS.filter(b => b.id !== book.id).slice(0, 3);
            relatedGrid.innerHTML = related.map(rel => `
                <div class="col-12 col-md-4">
                    <div class="story-card glow-effect-hover h-100">
                        <div class="book-card-img-wrap">
                            <span class="badge badge-glow book-badge-status">${rel.statusLabel}</span>
                            <button class="btn-wishlist-toggle book-action-btns" data-book-id="${rel.id}" onclick="toggleWishlist('${rel.id}', '${rel.title}')">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                            <img src="${rel.cover}" alt="${rel.title}" class="book-cover">
                        </div>
                        <div class="book-info-body">
                            <span class="book-genre">${rel.genre}</span>
                            <h4 class="book-title"><a href="book-details.html?id=${rel.id}">${rel.title}</a></h4>
                            <div class="book-author">By ${rel.author}</div>
                            <div class="book-rating"><i class="fa-solid fa-star text-warning me-1"></i> ${rel.rating}</div>
                            <div class="book-price-bar">
                                <span class="book-price">${rel.price}</span>
                                <a href="book-details.html?id=${rel.id}" class="btn btn-sm btn-story-outline">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    };

    initBookDetailsPage();

    // Make every visible book card behave like a proper catalogue item.
    // Clicking the image/card surface opens the exact title; explicit buttons and links keep their own actions.
    const initClickableBookCards = () => {
        document.querySelectorAll('.story-card').forEach(card => {
            const detailLink = card.querySelector('a[href*="book-details.html?id="]');
            if (!detailLink || card.dataset.bookCardReady === 'true') return;
            card.dataset.bookCardReady = 'true';
            card.classList.add('book-card-clickable');
            card.addEventListener('click', event => {
                if (event.target.closest('a, button, input, select, textarea, label')) return;
                window.location.href = detailLink.href;
            });
        });
    };

    initClickableBookCards();

    // 6. Initial Default Data Seeders
    if (!localStorage.getItem(STORAGE_KEYS.BORROWED_BOOKS)) {
        const defaultBorrowed = [
            {
                id: 'b1',
                title: 'The Quiet Archive',
                author: 'Clara Vance',
                borrowedDate: '2026-08-01',
                dueDate: '2026-08-28',
                cover: 'assets/images/books/book1.jpg',
                renewalsLeft: 2
            },
            {
                id: 'b3',
                title: 'Letters from Winter',
                author: 'Evelyn Harper',
                borrowedDate: '2026-08-10',
                dueDate: '2026-08-31',
                cover: 'assets/images/books/book3.jpg',
                renewalsLeft: 1
            }
        ];
        localStorage.setItem(STORAGE_KEYS.BORROWED_BOOKS, JSON.stringify(defaultBorrowed));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BORROW_REQUESTS)) {
        const defaultRequests = [
            {
                id: 'REQ-9012',
                memberName: 'Kavya Sharma',
                memberPlan: 'Explorer Plan',
                bookTitle: 'The Quiet Archive',
                requestDate: '2026-08-20',
                availability: '4 Copies Available',
                status: 'Pending'
            },
            {
                id: 'REQ-9013',
                memberName: 'Rohan Patel',
                memberPlan: 'Family Plan',
                bookTitle: 'Beyond the Lantern',
                requestDate: '2026-08-20',
                availability: '1 Copy Available',
                status: 'Pending'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.BORROW_REQUESTS, JSON.stringify(defaultRequests));
    }

    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(['b2', 'b6']));
    }

    // 5. Theme Switcher (Dark / Light Mode)
    const initTheme = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        updateThemeIcons(savedTheme);
    };

    const updateThemeIcons = (theme) => {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
            btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
        });
    };

    window.toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        updateThemeIcons(newTheme);
        showToast('Theme Updated', `Switched to ${newTheme.toUpperCase()} mode.`, 'info');
    };

    initTheme();

    // 6. RTL Switcher (Right-To-Left)
    const initRTL = () => {
        const savedRTL = localStorage.getItem(STORAGE_KEYS.RTL) || 'ltr';
        document.documentElement.setAttribute('dir', savedRTL);
        updateRTLButtons(savedRTL);
    };

    const updateRTLButtons = (dir) => {
        document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
            btn.setAttribute('title', `Switch to ${dir === 'rtl' ? 'LTR' : 'RTL'} Layout`);
            btn.setAttribute('aria-label', `Switch to ${dir === 'rtl' ? 'LTR' : 'RTL'} Layout`);
        });
    };

    window.toggleRTL = () => {
        const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
        const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
        document.documentElement.setAttribute('dir', newDir);
        localStorage.setItem(STORAGE_KEYS.RTL, newDir);
        updateRTLButtons(newDir);
        showToast('Layout Direction', `Switched to ${newDir.toUpperCase()} layout.`, 'info');
    };

    initRTL();

    // 7. Toast Notification System
    window.showToast = (title, message, type = 'success') => {
        let container = document.querySelector('.toast-container-custom');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container-custom';
            document.body.appendChild(container);
        }

        const iconMap = {
            success: 'fa-circle-check text-success',
            info: 'fa-circle-info text-info',
            warning: 'fa-triangle-exclamation text-warning',
            danger: 'fa-circle-xmark text-danger'
        };

        const toast = document.createElement('div');
        toast.className = `custom-toast toast-${type}`;
        toast.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <i class="fa-solid ${iconMap[type] || iconMap.info} fs-4"></i>
                <div>
                    <h6 class="mb-0 fw-bold" style="font-size: 0.95rem;">${title}</h6>
                    <small style="opacity: 0.85; font-size: 0.825rem;">${message}</small>
                </div>
            </div>
            <button type="button" class="btn-close ms-3" style="font-size: 0.75rem;" onclick="this.parentElement.remove()"></button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    };

    // 8. Wishlist Interactivity
    const updateWishlistCounter = () => {
        const wishlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
        document.querySelectorAll('.wishlist-count-badge').forEach(badge => {
            badge.textContent = wishlist.length;
        });

        document.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
            const bookId = btn.getAttribute('data-book-id');
            if (wishlist.includes(bookId)) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'fa-solid fa-heart';
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').className = 'fa-regular fa-heart';
            }
        });
    };

    window.toggleWishlist = (bookId, title = 'Book') => {
        let wishlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
        if (wishlist.includes(bookId)) {
            wishlist = wishlist.filter(id => id !== bookId);
            showToast('Wishlist Removed', `"${title}" removed from your saved books.`, 'info');
        } else {
            wishlist.push(bookId);
            showToast('Wishlist Saved', `"${title}" added to your saved books!`, 'success');
        }
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
        updateWishlistCounter();
    };

    updateWishlistCounter();

    // 9. Member Borrow Request
    window.requestBorrow = (bookTitle) => {
        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROW_REQUESTS) || '[]');
        const newReq = {
            id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
            memberName: 'Arjun Nair',
            memberPlan: 'Explorer Plan',
            bookTitle: bookTitle,
            requestDate: new Date().toISOString().split('T')[0],
            availability: 'Available In Desk',
            status: 'Pending'
        };
        requests.unshift(newReq);
        localStorage.setItem(STORAGE_KEYS.BORROW_REQUESTS, JSON.stringify(requests));
        showToast('Borrow Request Submitted', `Your borrow request for "${bookTitle}" has been sent to admin for approval!`, 'success');
        renderAdminBorrowRequests();
    };

    // 10. Admin Borrow Request Approval Flow
    window.approveBorrowRequest = (reqId) => {
        let requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROW_REQUESTS) || '[]');
        let approvedItem = null;

        requests = requests.map(req => {
            if (req.id === reqId) {
                req.status = 'Approved';
                approvedItem = req;
            }
            return req;
        });

        if (approvedItem) {
            localStorage.setItem(STORAGE_KEYS.BORROW_REQUESTS, JSON.stringify(requests));

            // Add to active borrowed books
            let borrowed = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROWED_BOOKS) || '[]');
            const dueDateObj = new Date();
            dueDateObj.setDate(dueDateObj.getDate() + 14);

            borrowed.unshift({
                id: 'b_' + Date.now(),
                title: approvedItem.bookTitle,
                author: 'Curated Author',
                borrowedDate: new Date().toISOString().split('T')[0],
                dueDate: dueDateObj.toISOString().split('T')[0],
                cover: 'assets/images/books/book1.jpg',
                renewalsLeft: 2
            });

            localStorage.setItem(STORAGE_KEYS.BORROWED_BOOKS, JSON.stringify(borrowed));
            showToast('Request Approved', `Borrow request ${reqId} approved successfully. Book added to member account.`, 'success');
            renderAdminBorrowRequests();
            renderBorrowedBooksTable();
        }
    };

    window.rejectBorrowRequest = (reqId) => {
        let requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROW_REQUESTS) || '[]');
        requests = requests.map(req => {
            if (req.id === reqId) {
                req.status = 'Rejected';
            }
            return req;
        });
        localStorage.setItem(STORAGE_KEYS.BORROW_REQUESTS, JSON.stringify(requests));
        showToast('Request Rejected', `Borrow request ${reqId} rejected.`, 'warning');
        renderAdminBorrowRequests();
    };

    const renderAdminBorrowRequests = () => {
        const tbody = document.getElementById('admin-borrow-requests-tbody');
        if (!tbody) return;

        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROW_REQUESTS) || '[]');
        if (requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No borrow requests found.</td></tr>';
            return;
        }

        tbody.innerHTML = requests.map(req => {
            let statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
            if (req.status === 'Approved') statusBadge = '<span class="badge bg-success">Approved</span>';
            if (req.status === 'Rejected') statusBadge = '<span class="badge bg-danger">Rejected</span>';

            return `
                <tr>
                    <td><code>#${req.id}</code></td>
                    <td><strong>${req.memberName}</strong><br><small class="text-muted">${req.memberPlan}</small></td>
                    <td><strong>${req.bookTitle}</strong></td>
                    <td>${req.requestDate}</td>
                    <td><span class="badge bg-surface-alt text-dark border border-color">${req.availability}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        ${req.status === 'Pending' ? `
                            <button class="btn btn-sm btn-success me-1" onclick="approveBorrowRequest('${req.id}')"><i class="fa-solid fa-check me-1"></i> Approve</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="rejectBorrowRequest('${req.id}')"><i class="fa-solid fa-xmark me-1"></i> Reject</button>
                        ` : `<span class="small text-muted">Action Completed</span>`}
                    </td>
                </tr>
            `;
        }).join('');
    };

    renderAdminBorrowRequests();

    // 11. Member Dashboard Renewal Action
    window.renewBook = (bookId) => {
        let borrowed = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROWED_BOOKS) || '[]');
        let renewedItem = null;

        borrowed = borrowed.map(book => {
            if (book.id === bookId) {
                if (book.renewalsLeft <= 0) {
                    showToast('Renewal Limit Reached', `No more renewals allowed for "${book.title}". Please return the item.`, 'warning');
                    return book;
                }
                const currentDue = new Date(book.dueDate);
                currentDue.setDate(currentDue.getDate() + 14);
                book.dueDate = currentDue.toISOString().split('T')[0];
                book.renewalsLeft -= 1;
                renewedItem = book;
            }
            return book;
        });

        if (renewedItem) {
            localStorage.setItem(STORAGE_KEYS.BORROWED_BOOKS, JSON.stringify(borrowed));
            showToast('Book Renewed Successfully', `"${renewedItem.title}" borrowing period extended to ${renewedItem.dueDate}!`, 'success');
            renderBorrowedBooksTable();
        }
    };

    // Render Borrowed Books inside Member Dashboard
    const renderBorrowedBooksTable = () => {
        const container = document.getElementById('member-borrowed-list');
        if (!container) return;

        const borrowed = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROWED_BOOKS) || '[]');
        if (borrowed.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No active borrowings found.</td></tr>';
            return;
        }

        container.innerHTML = borrowed.map(book => {
            const today = new Date();
            const due = new Date(book.dueDate);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            const statusBadge = diffDays < 3 ? '<span class="badge bg-danger">Due Soon</span>' : '<span class="badge bg-success">Active</span>';

            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <img src="${book.cover}" alt="${book.title}" style="width: 42px; height: 60px; object-fit: cover; border-radius: 4px;">
                            <div>
                                <h6 class="mb-0 fw-bold">${book.title}</h6>
                                <small class="text-muted">${book.author}</small>
                            </div>
                        </div>
                    </td>
                    <td>${book.borrowedDate}</td>
                    <td><strong class="text-primary">${book.dueDate}</strong></td>
                    <td><span class="fw-semibold">${diffDays > 0 ? diffDays + ' days left' : 'Due Today'}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-story-outline" onclick="renewBook('${book.id}')" ${book.renewalsLeft <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-rotate-right me-1"></i> Renew (${book.renewalsLeft})
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    renderBorrowedBooksTable();

    // 12. Catalog Live Filters & Sorting (books.html)
    const catalogContainer = document.getElementById('catalog-books-grid');
    if (catalogContainer) {
        const searchInput = document.getElementById('catalog-search-input');
        const genreSelect = document.getElementById('catalog-genre-filter');
        const availabilitySelect = document.getElementById('catalog-availability-filter');
        const sortSelect = document.getElementById('catalog-sort-filter');
        const viewGridBtn = document.getElementById('view-grid-btn');
        const viewListBtn = document.getElementById('view-list-btn');

        const filterBooks = () => {
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const selectedGenre = genreSelect ? genreSelect.value : 'all';
            const selectedAvail = availabilitySelect ? availabilitySelect.value : 'all';
            const selectedSort = sortSelect ? sortSelect.value : 'popular';

            let cards = Array.from(catalogContainer.querySelectorAll('.catalog-item-col'));
            let visibleCount = 0;

            cards.forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const genre = (card.getAttribute('data-genre') || '').toLowerCase();
                const avail = card.getAttribute('data-availability') || 'available';

                const matchesQuery = !query || title.includes(query) || genre.includes(query);
                const matchesGenre = selectedGenre === 'all' || genre === selectedGenre.toLowerCase() || genre.includes(selectedGenre.toLowerCase());
                const matchesAvail = selectedAvail === 'all' || avail === selectedAvail;

                if (matchesQuery && matchesGenre && matchesAvail) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Handle Sorting if sort select is present
            if (sortSelect) {
                cards.sort((a, b) => {
                    const titleA = a.getAttribute('data-title') || '';
                    const titleB = b.getAttribute('data-title') || '';
                    const ratingA = parseFloat(a.getAttribute('data-rating') || '4.5');
                    const ratingB = parseFloat(b.getAttribute('data-rating') || '4.5');
                    const priceA = parseFloat(a.getAttribute('data-price') || '20');
                    const priceB = parseFloat(b.getAttribute('data-price') || '20');

                    if (selectedSort === 'rating') return ratingB - ratingA;
                    if (selectedSort === 'az') return titleA.localeCompare(titleB);
                    if (selectedSort === 'za') return titleB.localeCompare(titleA);
                    if (selectedSort === 'price-low') return priceA - priceB;
                    if (selectedSort === 'price-high') return priceB - priceA;
                    return 0; // default popular / original order
                });

                cards.forEach(card => catalogContainer.appendChild(card));
            }

            const countBadge = document.getElementById('results-count');
            if (countBadge) countBadge.textContent = `Showing ${visibleCount} Titles`;
        };

        if (searchInput) searchInput.addEventListener('input', filterBooks);
        if (genreSelect) genreSelect.addEventListener('change', filterBooks);
        if (availabilitySelect) availabilitySelect.addEventListener('change', filterBooks);
        if (sortSelect) sortSelect.addEventListener('change', filterBooks);

        if (viewListBtn && viewGridBtn) {
            viewListBtn.addEventListener('click', () => {
                catalogContainer.classList.add('catalog-list-view');
                viewListBtn.classList.add('active');
                viewGridBtn.classList.remove('active');
            });
            viewGridBtn.addEventListener('click', () => {
                catalogContainer.classList.remove('catalog-list-view');
                viewGridBtn.classList.add('active');
                viewListBtn.classList.remove('active');
            });
        }
    }

    // 13. Form Submissions
    document.querySelectorAll('form.needs-validation').forEach(form => {
        if (form.id === 'portalLoginForm' || form.id === 'registerForm') return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                showToast('Validation Error', 'Please complete all required form fields.', 'danger');
            } else {
                showToast('Submission Successful', 'Thank you! Your inquiry has been sent to StoryVault team.', 'success');
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    });
});


/* StoryVault v6: service routing, event filtering and event registration */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-select-card[data-href]').forEach(card => {
        const go = () => { if (card.dataset.href) window.location.href = card.dataset.href; };
        card.addEventListener('click', (event) => {
            if (event.target.closest('a, button, input, select, textarea, label')) return;
            go();
        });
        card.addEventListener('keydown', (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a, button, input, select, textarea')) {
                event.preventDefault(); go();
            }
        });
    });
});

window.filterEvents = (category, trigger) => {
    document.querySelectorAll('.event-item').forEach(item => {
        const show = category === 'all' || item.dataset.eventCategory === category;
        item.hidden = !show;
    });
    document.querySelectorAll('[data-event-filter]').forEach(btn => btn.classList.toggle('active', btn === trigger));
};

window.openEventRegistration = (eventName) => {
    const modalEl = document.getElementById('eventRegistrationModal');
    if (!modalEl) return;
    const title = document.getElementById('eventRegistrationTitle');
    const input = document.getElementById('eventRegistrationName');
    if (title) title.textContent = eventName;
    if (input) input.value = eventName;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
};

window.finishEventRegistration = (form) => {
    const modalEl = document.getElementById('eventRegistrationModal');
    const eventName = document.getElementById('eventRegistrationName')?.value || 'StoryVault event';
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    if (form) form.reset();
    showToast('Seat Request Received', `Your request for ${eventName} has been recorded.`, 'success');
};

/* ========================================================================== 
   StoryVault India v7 - Per-user live data layer
   --------------------------------------------------------------------------
   This layer upgrades the static template into a realistic browser-persistent
   demo: real sign-up members start EMPTY, demo content belongs only to the
   explicit demo member, and admin views react to member requests/orders.
   Data syncs instantly across tabs on the same browser/origin via
   BroadcastChannel + localStorage events. A production multi-device site still
   requires a real backend/database.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const LIVE_KEYS = {
        REQUESTS: 'storyvault_live_requests_v7',
        BORROWED: 'storyvault_live_borrowed_by_user_v7',
        HISTORY: 'storyvault_live_history_by_user_v7',
        ORDERS: 'storyvault_live_orders_v7',
        SEED: 'storyvault_live_seed_v7',
        REGISTERED: 'storyvault_registered_users',
        CATALOG: 'storyvault_books',
        USER: 'storyvault_user',
        WISHLISTS: 'storyvault_live_wishlists_by_user_v7'
    };

    const DEMO = {
        member: {
            email: 'member@storyvault.org', password: 'Member@123', name: 'Arjun Nair', role: 'member',
            plan: 'Explorer Member', phone: '+91 98765 43210', city: 'Bengaluru', isDemo: true,
            avatar: 'assets/images/avatar-member.svg'
        },
        admin: {
            email: 'admin@storyvault.org', password: 'Admin@123', name: 'Meera Krishnan', role: 'admin',
            title: 'Head Librarian & Administrator', isDemo: true, avatar: 'assets/images/team/team1.jpg'
        }
    };

    const INR_MAP = {
        b1: 599, b2: 549, b3: 499, b4: 699, b5: 399,
        b6: 749, b7: 579, b8: 629, b9: 649, b10: 699
    };

    const parseJSON = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (_) { return fallback; }
    };
    const saveJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const esc = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
    const dateLabel = value => {
        if (!value) return '—';
        const d = new Date(value + (String(value).length === 10 ? 'T00:00:00' : ''));
        return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day:'2-digit', month:'short', year:'numeric' }).format(d);
    };
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const userKey = user => String(user?.email || 'guest').trim().toLowerCase();
    const currentUser = () => {
        try { return JSON.parse(localStorage.getItem(LIVE_KEYS.USER) || 'null'); } catch (_) { return null; }
    };
    const planLimit = plan => /family/i.test(plan || '') ? 10 : /explorer/i.test(plan || '') ? 6 : 3;

    let channel = null;
    try { channel = new BroadcastChannel('storyvault-live-v7'); } catch (_) {}
    const notifyLive = (type = 'update') => {
        try { channel?.postMessage({ type, at: Date.now() }); } catch (_) {}
    };

    const normalizedCatalog = () => {
        let catalog = parseJSON(LIVE_KEYS.CATALOG, []);
        if (!Array.isArray(catalog) || !catalog.length) catalog = Array.isArray(window.STORYVAULT_BOOKS) ? window.STORYVAULT_BOOKS : [];
        catalog = catalog.map((book, index) => {
            const id = book.id || `b${index + 1}`;
            const mapped = INR_MAP[id];
            const priceVal = mapped ?? (Number(book.priceVal) > 100 ? Number(book.priceVal) : 599);
            const copies = Number.isFinite(Number(book.copies)) ? Number(book.copies) : 0;
            return {
                ...book, id, priceVal, price: money(priceVal), copies,
                totalCopies: Number(book.totalCopies || Math.max(copies, copies + 2))
            };
        });
        saveJSON(LIVE_KEYS.CATALOG, catalog);
        return catalog;
    };
    const getLiveCatalog = () => normalizedCatalog();
    const getLiveBook = idOrTitle => {
        const needle = String(idOrTitle || '').toLowerCase();
        return getLiveCatalog().find(b => String(b.id).toLowerCase() === needle || String(b.title).toLowerCase() === needle) || null;
    };

    const demoBorrowed = [
        { id:'demo-loan-1', bookId:'b1', title:'The Quiet Archive', author:'Clara Vance', borrowedDate:'2026-08-01', dueDate:'2026-08-28', cover:'assets/images/books/book1.jpg', renewalsLeft:2, isDemo:true },
        { id:'demo-loan-2', bookId:'b3', title:'Letters from Winter', author:'Evelyn Harper', borrowedDate:'2026-08-10', dueDate:'2026-08-31', cover:'assets/images/books/book3.jpg', renewalsLeft:1, isDemo:true }
    ];
    const demoHistory = [
        { id:'hist-demo-1', title:'The Midnight Cartographer', author:'Cassandra Vale', borrowedDate:'2026-06-10', returnedDate:'2026-07-08', status:'Returned On Time', isDemo:true },
        { id:'hist-demo-2', title:'A Study in Rain', author:'Soren Lindqvist', borrowedDate:'2026-05-01', returnedDate:'2026-05-28', status:'Returned On Time', isDemo:true }
    ];
    const demoRequests = [
        { id:'REQ-9012', memberEmail:DEMO.member.email, memberName:DEMO.member.name, memberPlan:DEMO.member.plan, bookId:'b6', bookTitle:'The Midnight Cartographer', requestDate:'2026-08-20', availability:'2 Copies Available', status:'Pending', isDemo:true },
        { id:'REQ-9013', memberEmail:'demo.kavya@storyvault.org', memberName:'Kavya Sharma', memberPlan:'Family Member', bookId:'b2', bookTitle:'Beyond the Lantern', requestDate:'2026-08-20', availability:'1 Copy Available', status:'Pending', isDemo:true }
    ];
    const demoOrders = [
        { id:'ORD-8810', memberEmail:'demo.rohan@storyvault.org', customer:'Rohan Patel', bookId:'b1', bookTitle:'The Quiet Archive', date:'2026-08-20', amount:599, status:'Shipped', isDemo:true }
    ];

    const ensureLiveSeed = () => {
        normalizedCatalog();
        let borrowed = parseJSON(LIVE_KEYS.BORROWED, {});
        let history = parseJSON(LIVE_KEYS.HISTORY, {});
        let requests = parseJSON(LIVE_KEYS.REQUESTS, null);
        let orders = parseJSON(LIVE_KEYS.ORDERS, null);
        let wishes = parseJSON(LIVE_KEYS.WISHLISTS, {});
        if (!borrowed || Array.isArray(borrowed)) borrowed = {};
        if (!history || Array.isArray(history)) history = {};
        if (!wishes || Array.isArray(wishes)) wishes = {};
        if (!Array.isArray(requests)) requests = demoRequests.slice();
        if (!Array.isArray(orders)) orders = demoOrders.slice();
        if (!borrowed[DEMO.member.email]) borrowed[DEMO.member.email] = demoBorrowed.slice();
        if (!history[DEMO.member.email]) history[DEMO.member.email] = demoHistory.slice();
        if (!wishes[DEMO.member.email]) wishes[DEMO.member.email] = ['b2','b6'];
        saveJSON(LIVE_KEYS.BORROWED, borrowed);
        saveJSON(LIVE_KEYS.HISTORY, history);
        saveJSON(LIVE_KEYS.REQUESTS, requests);
        saveJSON(LIVE_KEYS.ORDERS, orders);
        saveJSON(LIVE_KEYS.WISHLISTS, wishes);
        localStorage.setItem(LIVE_KEYS.SEED, '1');
    };
    ensureLiveSeed();

    const initEmptyMemberState = email => {
        const key = String(email || '').toLowerCase();
        if (!key || key === DEMO.member.email) return;
        const borrowed = parseJSON(LIVE_KEYS.BORROWED, {});
        const history = parseJSON(LIVE_KEYS.HISTORY, {});
        const wishes = parseJSON(LIVE_KEYS.WISHLISTS, {});
        if (!borrowed[key]) borrowed[key] = [];
        if (!history[key]) history[key] = [];
        if (!wishes[key]) wishes[key] = [];
        saveJSON(LIVE_KEYS.BORROWED, borrowed);
        saveJSON(LIVE_KEYS.HISTORY, history);
        saveJSON(LIVE_KEYS.WISHLISTS, wishes);
    };

    // ---------- Authentication override: demo data only for explicit demo account ----------
    window.registerMember = event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
        const name = document.getElementById('registerName')?.value.trim() || '';
        const email = document.getElementById('registerEmail')?.value.trim().toLowerCase() || '';
        const password = document.getElementById('registerPassword')?.value || '';
        const phone = document.getElementById('registerPhone')?.value.trim() || '';
        const city = document.getElementById('registerCity')?.value.trim() || '';
        let registered = parseJSON(LIVE_KEYS.REGISTERED, []);
        if (!Array.isArray(registered)) registered = [];
        if (registered.some(u => String(u.email).toLowerCase() === email) || [DEMO.member.email, DEMO.admin.email].includes(email)) {
            showToast('Account Exists', 'An account with this email already exists. Please sign in.', 'warning'); return;
        }
        const profile = {
            id: `MEM-${Date.now()}`, name, email, password, phone, city,
            role:'member', plan:'Reader Member', avatar:'assets/images/avatar-member.svg',
            joinedAt:new Date().toISOString(), createdAt:new Date().toISOString(), isDemo:false, status:'Active'
        };
        registered.push(profile);
        saveJSON(LIVE_KEYS.REGISTERED, registered);
        initEmptyMemberState(email);
        window.setCurrentUser?.({ ...profile, password: undefined });
        notifyLive('member-created');
        showToast('Account Created', 'Your StoryVault India account is ready. Your library starts empty and updates as you use it.', 'success');
        setTimeout(() => window.location.href = 'member-dashboard.html', 600);
    };

    window.handlePortalLogin = event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
        const role = document.getElementById('loginRoleSelect')?.value || 'member';
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';
        let user = null;
        if (role === 'admin' && email === DEMO.admin.email && password === DEMO.admin.password) user = { ...DEMO.admin };
        if (role === 'member' && email === DEMO.member.email && password === DEMO.member.password) user = { ...DEMO.member };
        if (!user && role === 'member') {
            const registered = parseJSON(LIVE_KEYS.REGISTERED, []);
            const match = Array.isArray(registered) ? registered.find(u => String(u.email).toLowerCase() === email && u.password === password) : null;
            if (match) {
                user = {
                    id: match.id || `MEM-${Date.now()}`, name:match.name, email:match.email, role:'member',
                    plan:match.plan || 'Reader Member', phone:match.phone || '', city:match.city || '',
                    joinedAt:match.joinedAt || match.createdAt || new Date().toISOString(), status:match.status || 'Active',
                    avatar:match.avatar || 'assets/images/avatar-member.svg', isDemo:false
                };
                initEmptyMemberState(user.email);
            }
        }
        if (!user) {
            emailInput?.classList.add('is-invalid'); passwordInput?.classList.add('is-invalid');
            const error = document.getElementById('loginError'); if (error) error.style.display='block';
            showToast('Sign In Failed', 'Check the email, password, and selected portal.', 'danger'); return;
        }
        emailInput?.classList.remove('is-invalid'); passwordInput?.classList.remove('is-invalid');
        window.setCurrentUser?.(user);
        window.syncAuthenticatedNavigation?.();
        showToast('Signed In', `Welcome ${user.name}. Opening your portal...`, 'success');
        setTimeout(() => window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'member-dashboard.html', 550);
    };

    window.handleSocialLogin = provider => {
        const label = provider === 'google' ? 'Google' : 'Instagram';
        const email = `${provider}.member@storyvault.local`;
        let registered = parseJSON(LIVE_KEYS.REGISTERED, []);
        if (!Array.isArray(registered)) registered=[];
        let match = registered.find(u => u.email === email);
        if (!match) {
            match = { id:`MEM-${Date.now()}`, name:`${label} Member`, email, password:'social-login', phone:'', city:'', role:'member', plan:'Reader Member', avatar:'assets/images/avatar-member.svg', joinedAt:new Date().toISOString(), isDemo:false, provider, status:'Active' };
            registered.push(match); saveJSON(LIVE_KEYS.REGISTERED, registered); initEmptyMemberState(email); notifyLive('member-created');
        }
        window.setCurrentUser?.({ ...match, password: undefined });
        window.syncAuthenticatedNavigation?.();
        showToast('Signed In', `${label} member access opened with a fresh library profile.`, 'success');
        setTimeout(() => window.location.href='member-dashboard.html', 500);
    };

    // ---------- Per-member requests, borrowed books, history ----------
    const memberBorrowed = email => {
        const store = parseJSON(LIVE_KEYS.BORROWED, {}); return Array.isArray(store[String(email).toLowerCase()]) ? store[String(email).toLowerCase()] : [];
    };
    const saveMemberBorrowed = (email, list) => {
        const store = parseJSON(LIVE_KEYS.BORROWED, {}); store[String(email).toLowerCase()] = list; saveJSON(LIVE_KEYS.BORROWED, store);
    };
    const memberHistory = email => {
        const store = parseJSON(LIVE_KEYS.HISTORY, {}); return Array.isArray(store[String(email).toLowerCase()]) ? store[String(email).toLowerCase()] : [];
    };

    window.requestBorrow = idOrTitle => {
        const user = currentUser();
        if (!user || user.role !== 'member') {
            showToast('Member Sign In Required', 'Please sign in or create a member account before borrowing a book.', 'warning');
            setTimeout(() => window.location.href='login.html', 700); return;
        }
        const book = getLiveBook(idOrTitle) || getLiveCatalog().find(b => b.title === idOrTitle);
        if (!book) { showToast('Book Not Found', 'This title could not be found in the current catalog.', 'danger'); return; }
        let requests = parseJSON(LIVE_KEYS.REQUESTS, []);
        const email = userKey(user);
        const existing = requests.find(r => r.memberEmail === email && r.bookId === book.id && r.status === 'Pending');
        if (existing) { showToast('Request Already Pending', `Your request for “${book.title}” is already waiting for approval.`, 'info'); return; }
        if (memberBorrowed(email).some(b => b.bookId === book.id)) { showToast('Already Borrowed', `“${book.title}” is already on your shelf.`, 'info'); return; }
        const req = {
            id:`REQ-${String(Date.now()).slice(-6)}`, memberEmail:email, memberName:user.name,
            memberPlan:user.plan || 'Reader Member', bookId:book.id, bookTitle:book.title,
            requestDate:todayISO(), availability:book.copies > 0 ? `${book.copies} ${book.copies === 1 ? 'Copy' : 'Copies'} Available` : 'Reserve / Waitlist',
            status:'Pending', isDemo:Boolean(user.isDemo), createdAt:new Date().toISOString()
        };
        requests.unshift(req); saveJSON(LIVE_KEYS.REQUESTS, requests); notifyLive('borrow-request');
        renderMemberDashboardLive(); renderAdminDashboardLive();
        showToast('Borrow Request Submitted', `“${book.title}” is now visible in your profile and the admin approval queue.`, 'success');
    };

    window.approveBorrowRequest = reqId => {
        const admin = currentUser();
        if (!admin || admin.role !== 'admin') return;
        let requests = parseJSON(LIVE_KEYS.REQUESTS, []);
        const idx = requests.findIndex(r => r.id === reqId);
        if (idx < 0 || requests[idx].status !== 'Pending') return;
        const req = requests[idx];
        let catalog = getLiveCatalog();
        const bookIdx = catalog.findIndex(b => b.id === req.bookId || b.title === req.bookTitle);
        const book = bookIdx >= 0 ? catalog[bookIdx] : null;
        if (book && book.copies <= 0) { showToast('No Copy Available', 'This title currently has no desk copy. Keep it pending or reject the request.', 'warning'); return; }
        requests[idx] = { ...req, status:'Approved', approvedAt:new Date().toISOString() };
        saveJSON(LIVE_KEYS.REQUESTS, requests);
        const email = String(req.memberEmail || '').toLowerCase();
        const loans = memberBorrowed(email);
        if (!loans.some(l => l.requestId === req.id)) {
            const due = new Date(); due.setDate(due.getDate() + 14);
            loans.unshift({
                id:`LOAN-${Date.now()}`, requestId:req.id, bookId:book?.id || req.bookId,
                title:req.bookTitle, author:book?.author || 'StoryVault Author', cover:book?.cover || 'assets/images/books/book1.jpg',
                borrowedDate:todayISO(), dueDate:due.toISOString().slice(0,10), renewalsLeft:2, isDemo:Boolean(req.isDemo)
            });
            saveMemberBorrowed(email, loans);
        }
        if (bookIdx >= 0) { catalog[bookIdx].copies = Math.max(0, Number(catalog[bookIdx].copies)-1); catalog[bookIdx].availability = catalog[bookIdx].copies > 0 ? 'available' : 'borrowed'; catalog[bookIdx].stock = catalog[bookIdx].copies > 0 ? `${catalog[bookIdx].copies} Copies Left` : 'On Reserve'; saveJSON(LIVE_KEYS.CATALOG, catalog); }
        notifyLive('request-approved'); renderAdminDashboardLive(); renderMemberDashboardLive();
        showToast('Request Approved', `${req.memberName} can now see “${req.bookTitle}” under Borrowed Books.`, 'success');
    };

    window.rejectBorrowRequest = reqId => {
        let requests = parseJSON(LIVE_KEYS.REQUESTS, []);
        const idx=requests.findIndex(r=>r.id===reqId);
        if(idx<0) return;
        requests[idx]={...requests[idx],status:'Rejected',resolvedAt:new Date().toISOString()}; saveJSON(LIVE_KEYS.REQUESTS,requests); notifyLive('request-rejected'); renderAdminDashboardLive(); renderMemberDashboardLive(); showToast('Request Rejected',`Borrow request ${reqId} was rejected.`,'warning');
    };

    window.renewBook = loanId => {
        const user=currentUser(); if(!user||user.role!=='member') return;
        const list=memberBorrowed(user.email); const idx=list.findIndex(b=>b.id===loanId);
        if(idx<0) return;
        if(Number(list[idx].renewalsLeft)<=0){showToast('Renewal Limit Reached','No more online renewals are available for this book.','warning');return;}
        const due=new Date(list[idx].dueDate+'T00:00:00'); due.setDate(due.getDate()+14); list[idx].dueDate=due.toISOString().slice(0,10); list[idx].renewalsLeft=Number(list[idx].renewalsLeft)-1; saveMemberBorrowed(user.email,list); notifyLive('loan-renewed'); renderMemberDashboardLive(); showToast('Book Renewed',`“${list[idx].title}” is extended by 14 days.`,'success');
    };

    window.returnBorrowedBook = loanId => {
        const admin=currentUser(); if(!admin||admin.role!=='admin') return;
        const borrowedStore=parseJSON(LIVE_KEYS.BORROWED,{}); let returned=null, returnedEmail='';
        Object.keys(borrowedStore).some(email=>{const idx=(borrowedStore[email]||[]).findIndex(l=>l.id===loanId); if(idx>=0){returned=borrowedStore[email][idx]; returnedEmail=email; borrowedStore[email].splice(idx,1); return true;} return false;});
        if(!returned) return;
        saveJSON(LIVE_KEYS.BORROWED,borrowedStore);
        const history=parseJSON(LIVE_KEYS.HISTORY,{}); if(!history[returnedEmail]) history[returnedEmail]=[]; history[returnedEmail].unshift({id:`HIST-${Date.now()}`,title:returned.title,author:returned.author,borrowedDate:returned.borrowedDate,returnedDate:todayISO(),status:'Returned',isDemo:Boolean(returned.isDemo)}); saveJSON(LIVE_KEYS.HISTORY,history);
        let catalog=getLiveCatalog(); const bi=catalog.findIndex(b=>b.id===returned.bookId); if(bi>=0){catalog[bi].copies=Number(catalog[bi].copies)+1; catalog[bi].availability='available'; catalog[bi].stock=`${catalog[bi].copies} Copies Left`; saveJSON(LIVE_KEYS.CATALOG,catalog);} notifyLive('book-returned'); renderAdminDashboardLive(); renderMemberDashboardLive();
    };

    // ---------- Per-user wishlist (prevents demo saved books leaking to new users) ----------
    const wishlistFor = user => {
        if (!user || user.role !== 'member') return [];
        const store=parseJSON(LIVE_KEYS.WISHLISTS,{}); return Array.isArray(store[userKey(user)])?store[userKey(user)]:[];
    };
    const refreshWishlist = () => {
        const user=currentUser(); const list=wishlistFor(user);
        document.querySelectorAll('.wishlist-count-badge').forEach(el=>el.textContent=list.length);
        document.querySelectorAll('.btn-wishlist-toggle').forEach(btn=>{const active=list.includes(btn.dataset.bookId); btn.classList.toggle('active',active); const i=btn.querySelector('i'); if(i)i.className=active?'fa-solid fa-heart':'fa-regular fa-heart';});
    };
    window.toggleWishlist = (bookId,title='Book') => {
        const user=currentUser(); if(!user||user.role!=='member'){showToast('Member Sign In Required','Sign in to save books to your profile.','warning');return;}
        const store=parseJSON(LIVE_KEYS.WISHLISTS,{}); const key=userKey(user); let list=Array.isArray(store[key])?store[key]:[];
        if(list.includes(bookId)){list=list.filter(id=>id!==bookId);showToast('Wishlist Removed',`“${title}” removed from saved books.`,'info');}else{list.push(bookId);showToast('Wishlist Saved',`“${title}” saved to your profile.`,'success');}
        store[key]=list;saveJSON(LIVE_KEYS.WISHLISTS,store);refreshWishlist();notifyLive('wishlist');
    };

    // ---------- Orders and admin live order queue ----------
    window.createBookOrder = bookId => {
        const user=currentUser(); if(!user||user.role!=='member'){showToast('Member Sign In Required','Please sign in before placing a bookstore order.','warning');setTimeout(()=>window.location.href='login.html',650);return;}
        const book=getLiveBook(bookId); if(!book)return;
        const orders=parseJSON(LIVE_KEYS.ORDERS,[]); const order={id:`ORD-${String(Date.now()).slice(-6)}`,memberEmail:userKey(user),customer:user.name,bookId:book.id,bookTitle:book.title,date:todayISO(),amount:Number(book.priceVal),status:'Placed',isDemo:Boolean(user.isDemo),createdAt:new Date().toISOString()}; orders.unshift(order); saveJSON(LIVE_KEYS.ORDERS,orders); notifyLive('new-order'); renderAdminDashboardLive(); showToast('Order Placed',`“${book.title}” ordered for ${money(book.priceVal)}. The admin dashboard has been updated.`,'success');
    };
    window.updateOrderStatus = (orderId,status) => {const orders=parseJSON(LIVE_KEYS.ORDERS,[]);const idx=orders.findIndex(o=>o.id===orderId);if(idx<0)return;orders[idx].status=status;saveJSON(LIVE_KEYS.ORDERS,orders);notifyLive('order-status');renderAdminDashboardLive();showToast('Order Status Updated',`${orderId} changed to ${status}.`,'success');};

    // ---------- Member dashboard renderer ----------
    function renderMemberDashboardLive(){
        if(!document.body.classList.contains('member-portal-page')) return;
        const user=currentUser(); if(!user||user.role!=='member')return;
        initEmptyMemberState(user.email);
        const email=userKey(user), loans=memberBorrowed(email), requests=parseJSON(LIVE_KEYS.REQUESTS,[]).filter(r=>r.memberEmail===email), history=memberHistory(email);
        const pending=requests.filter(r=>r.status==='Pending');
        const now=new Date();
        const dueSoon=loans.filter(l=>{const d=new Date(l.dueDate+'T23:59:59');const diff=Math.ceil((d-now)/86400000);return diff>=0&&diff<=7;});
        const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val;};
        set('memberDisplayName',user.name); set('memberWelcomeName',(user.name||'Member').split(/\s+/)[0]); set('memberPlanBadge',user.plan||'Reader Member');
        const avatar=document.getElementById('memberProfileAvatar'); if(avatar){avatar.src=user.avatar||'assets/images/avatar-member.svg';avatar.alt=`${user.name} avatar`;}
        const limit=planLimit(user.plan); set('memberBorrowedMetric',`${loans.length} / ${limit}`); set('memberBorrowedSubMetric',`${Math.max(0,limit-loans.length)} slots remaining`);
        set('memberDueMetric',dueSoon.length?`${dueSoon.length} ${dueSoon.length===1?'Book':'Books'}`:'0'); set('memberDueSubMetric',dueSoon.length?'Due within 7 days':'Nothing due soon');
        set('memberRequestMetric',String(pending.length)); set('memberRequestSubMetric',pending.length?'Awaiting approval':'No pending requests');
        set('memberPlanMetric','Active'); set('memberPlanSubMetric',user.plan||'Reader Member');
        set('memberNotificationCount',String(pending.length+dueSoon.length)); set('memberNotificationSummary',(pending.length+dueSoon.length)?`${pending.length+dueSoon.length} updates in your library`:'No new updates');
        const notices=[]; if(pending[0])notices.push(`<div class="portal-notification-item border-bottom"><strong>Borrow request pending</strong><div class="text-muted">${esc(pending[0].bookTitle)} is awaiting librarian approval.</div></div>`); if(dueSoon[0])notices.push(`<div class="portal-notification-item"><strong>Book due soon</strong><div class="text-muted">${esc(dueSoon[0].title)} is due on ${dateLabel(dueSoon[0].dueDate)}.</div></div>`); const nl=document.getElementById('memberNotificationsList');if(nl)nl.innerHTML=notices.length?notices.join(''):'<div class="text-muted small py-2">You are all caught up.</div>';
        const tbody=document.getElementById('member-borrowed-list'); if(tbody){tbody.innerHTML=loans.length?loans.map(l=>{const diff=Math.ceil((new Date(l.dueDate+'T23:59:59')-now)/86400000);const badge=diff<3?'<span class="badge bg-danger">Due Soon</span>':'<span class="badge bg-success">Active</span>';return `<tr><td><div class="d-flex align-items-center gap-3"><img src="${esc(l.cover)}" alt="${esc(l.title)}" style="width:42px;height:60px;object-fit:cover;border-radius:4px"><div><h6 class="mb-0 fw-bold">${esc(l.title)}</h6><small class="text-muted">${esc(l.author)}</small></div></div></td><td>${dateLabel(l.borrowedDate)}</td><td><strong class="text-primary">${dateLabel(l.dueDate)}</strong></td><td>${diff>0?`${diff} days left`:diff===0?'Due today':'Overdue'}</td><td>${badge}</td><td><button class="btn btn-sm btn-story-outline" onclick="renewBook('${esc(l.id)}')" ${Number(l.renewalsLeft)<=0?'disabled':''}><i class="fa-solid fa-rotate-right me-1"></i> Renew (${Number(l.renewalsLeft)||0})</button></td></tr>`;}).join(''):'<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-book-open fs-3 d-block mb-2"></i>No active borrowings yet. Borrow a title and it will appear here after admin approval.</td></tr>';}
        const latest=document.getElementById('member-latest-request'); if(latest){const r=requests[0];if(!r)latest.innerHTML='<div class="text-center text-muted py-3"><i class="fa-regular fa-bell fs-3 d-block mb-2"></i>No requests yet. Your first borrow request will appear here.</div>';else{const cls=r.status==='Approved'?'bg-success':r.status==='Rejected'?'bg-danger':'bg-warning text-dark';latest.innerHTML=`<div class="request-status-icon"><i class="fa-solid ${r.status==='Pending'?'fa-hourglass-half':r.status==='Approved'?'fa-circle-check':'fa-circle-xmark'}"></i></div><div><strong>${esc(r.bookTitle)}</strong><p class="small text-muted mb-1">Request #${esc(r.id)} · Submitted ${dateLabel(r.requestDate)}</p><span class="badge ${cls}">${esc(r.status)}</span></div>`;}}
        const hb=document.getElementById('member-history-list');if(hb){hb.innerHTML=history.length?history.map(h=>`<tr><td><strong>${esc(h.title)}</strong></td><td>${esc(h.author||'—')}</td><td>${dateLabel(h.borrowedDate)}</td><td>${dateLabel(h.returnedDate)}</td><td><span class="badge bg-success">${esc(h.status||'Returned')}</span></td></tr>`).join(''):'<tr><td colspan="5" class="text-center py-5 text-muted">No borrowing history yet.</td></tr>';}
        refreshWishlist();
    }
    window.renderMemberDashboardLive=renderMemberDashboardLive;

    // ---------- Admin live renderers ----------
    const demoMembers = [
        {name:'Arjun Nair',email:DEMO.member.email,plan:'Explorer Member',joinedAt:'2026-01-12',status:'Active',isDemo:true,avatar:'assets/images/avatar-member.svg'},
        {name:'Kavya Sharma',email:'demo.kavya@storyvault.org',plan:'Family Member',joinedAt:'2026-03-08',status:'Active',isDemo:true,avatar:'assets/images/avatar-member.svg'}
    ];
    const allMemberRows = () => {
        const registered=parseJSON(LIVE_KEYS.REGISTERED,[]); const real=(Array.isArray(registered)?registered:[]).map(u=>({name:u.name,email:u.email,plan:u.plan||'Reader Member',joinedAt:(u.joinedAt||u.createdAt||todayISO()).slice(0,10),status:u.status||'Active',isDemo:false,phone:u.phone||'',city:u.city||'',avatar:u.avatar||'assets/images/avatar-member.svg'}));
        return [...demoMembers,...real];
    };
    function renderAdminBorrowRequestsLive(){
        const tbody=document.getElementById('admin-borrow-requests-tbody');if(!tbody)return;
        const requests=parseJSON(LIVE_KEYS.REQUESTS,[]); const pendingCount=requests.filter(r=>r.status==='Pending').length; const pb=document.getElementById('admin-pending-count');if(pb)pb.textContent=`${pendingCount} Pending`;
        tbody.innerHTML=requests.length?requests.map(r=>{const status=r.status==='Approved'?'<span class="badge bg-success">Approved</span>':r.status==='Rejected'?'<span class="badge bg-danger">Rejected</span>':'<span class="badge bg-warning text-dark">Pending</span>';return `<tr><td><code>#${esc(r.id)}</code>${r.isDemo?'<br><small class="text-muted">Demo</small>':''}</td><td><strong>${esc(r.memberName)}</strong><br><small class="text-muted">${esc(r.memberPlan)}</small></td><td><strong>${esc(r.bookTitle)}</strong></td><td>${dateLabel(r.requestDate)}</td><td><span class="badge bg-surface-alt text-dark border border-color">${esc(r.availability||'Check stock')}</span></td><td>${status}</td><td>${r.status==='Pending'?`<button class="btn btn-sm btn-success me-1" onclick="approveBorrowRequest('${esc(r.id)}')"><i class="fa-solid fa-check me-1"></i>Approve</button><button class="btn btn-sm btn-outline-danger" onclick="rejectBorrowRequest('${esc(r.id)}')"><i class="fa-solid fa-xmark me-1"></i>Reject</button>`:'<span class="small text-muted">Action completed</span>'}</td></tr>`;}).join(''):'<tr><td colspan="7" class="text-center py-4 text-muted">No borrow requests found.</td></tr>';
    }
    function renderAdminCatalogLive(){
        const tbody=document.getElementById('admin-catalog-tbody');if(!tbody)return;const catalog=getLiveCatalog();
        tbody.innerHTML=catalog.map(b=>`<tr><td><div class="d-flex align-items-center gap-3"><img alt="${esc(b.title)}" class="rounded" src="${esc(b.cover||'assets/images/books/book1.jpg')}" style="width:40px;height:58px;object-fit:cover"><div><strong>${esc(b.title)}</strong><br><small class="text-muted">By ${esc(b.author||'StoryVault Author')}</small></div></div></td><td><span class="badge bg-surface-alt text-dark border">${esc(b.genreLabel||b.genre||'General')}</span></td><td><code>${esc(b.isbn||'—')}</code></td><td>${Number(b.totalCopies||b.copies)} Copies</td><td><strong class="${Number(b.copies)>1?'text-success':'text-warning'}">${Number(b.copies)} Available</strong></td><td>${money(b.priceVal)}</td><td><span class="badge ${Number(b.copies)>1?'bg-success':Number(b.copies)===1?'bg-warning text-dark':'bg-secondary'}">${Number(b.copies)>1?'In Stock':Number(b.copies)===1?'Low Stock':'Unavailable'}</span></td><td><a class="btn btn-sm btn-story-outline me-1" href="book-details.html?id=${encodeURIComponent(b.id)}"><i class="fa-solid fa-eye"></i></a><button class="btn btn-sm btn-story-secondary me-1" onclick="showToast('Catalog Item','${esc(b.title)} is stored in the live catalog.','info')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteCatalogBook('${esc(b.id)}')"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');
    }
    window.deleteCatalogBook=id=>{let catalog=getLiveCatalog();const b=catalog.find(x=>x.id===id);if(!b)return;if(String(id).match(/^b\d+$/)){showToast('Protected Core Title','Core StoryVault titles are kept in the catalog. Update stock instead of deleting them.','warning');return;}catalog=catalog.filter(x=>x.id!==id);saveJSON(LIVE_KEYS.CATALOG,catalog);notifyLive('catalog-delete');renderAdminDashboardLive();showToast('Book Removed',`“${b.title}” removed from the live catalog.`,'warning');};
    function renderAdminMembersLive(){
        const tbody=document.getElementById('admin-members-tbody');if(!tbody)return;const members=allMemberRows();const badge=document.getElementById('admin-members-count');if(badge)badge.textContent=`${members.length} Active Members`;
        const borrowedStore=parseJSON(LIVE_KEYS.BORROWED,{});
        tbody.innerHTML=members.map(m=>{const loans=Array.isArray(borrowedStore[String(m.email).toLowerCase()])?borrowedStore[String(m.email).toLowerCase()]:[];const overdue=loans.filter(l=>new Date(l.dueDate+'T23:59:59')<new Date()).length;return `<tr><td><div class="d-flex align-items-center gap-3"><img alt="${esc(m.name)}" class="rounded-circle" src="${esc(m.avatar)}" style="width:40px;height:40px;object-fit:cover"><div><strong>${esc(m.name)}</strong>${m.isDemo?' <span class="badge bg-secondary ms-1">Demo</span>':''}<br><small class="text-muted">${esc(m.email)}</small>${m.city?`<br><small class="text-muted"><i class="fa-solid fa-location-dot me-1"></i>${esc(m.city)}, India</small>`:''}</div></div></td><td><span class="badge bg-primary">${esc(m.plan)}</span></td><td>${dateLabel(m.joinedAt)}</td><td>${loans.length} / ${planLimit(m.plan)} Books</td><td><span class="badge ${overdue?'bg-danger':'bg-success'}">${overdue} Overdue</span></td><td><span class="badge bg-success">${esc(m.status||'Active')}</span></td><td><button class="btn btn-sm btn-story-secondary" onclick="showToast('Member Profile','${esc(m.name)} has ${loans.length} active loans.','info')">View</button></td></tr>`;}).join('');
    }
    function renderAdminOrdersLive(){
        const tbody=document.getElementById('admin-orders-tbody');if(!tbody)return;const orders=parseJSON(LIVE_KEYS.ORDERS,[]);const badge=document.getElementById('admin-orders-count');if(badge)badge.textContent=`${orders.length} Orders`;
        tbody.innerHTML=orders.length?orders.map(o=>`<tr><td><code>#${esc(o.id)}</code>${o.isDemo?'<br><small class="text-muted">Demo</small>':''}</td><td><strong>${esc(o.customer)}</strong></td><td>${esc(o.bookTitle)}</td><td>${dateLabel(o.date)}</td><td>${money(o.amount)}</td><td><span class="badge ${o.status==='Delivered'?'bg-success':o.status==='Cancelled'?'bg-danger':o.status==='Shipped'?'bg-info text-dark':'bg-warning text-dark'}">${esc(o.status)}</span></td><td><select class="form-select form-select-sm d-inline-block w-auto" onchange="updateOrderStatus('${esc(o.id)}',this.value)"><option value="Placed" ${o.status==='Placed'?'selected':''}>Placed</option><option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option><option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option><option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select></td></tr>`).join(''):'<tr><td colspan="7" class="text-center py-4 text-muted">No orders yet.</td></tr>';
    }
    function renderAdminMetricsLive(){
        if(!document.getElementById('adminMetricTotalBooks'))return;const catalog=getLiveCatalog(),members=allMemberRows(),borrowed=parseJSON(LIVE_KEYS.BORROWED,{}),requests=parseJSON(LIVE_KEYS.REQUESTS,[]),orders=parseJSON(LIVE_KEYS.ORDERS,[]);const allLoans=Object.values(borrowed).flatMap(v=>Array.isArray(v)?v:[]);const overdue=allLoans.filter(l=>new Date(l.dueDate+'T23:59:59')<new Date()).length;const pending=requests.filter(r=>r.status==='Pending').length;const orderValue=orders.filter(o=>String(o.date||'').slice(0,7)===todayISO().slice(0,7)).reduce((s,o)=>s+Number(o.amount||0),0);const totalBooks=catalog.reduce((s,b)=>s+Number(b.totalCopies||b.copies||0),0),available=catalog.reduce((s,b)=>s+Number(b.copies||0),0);const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};set('adminMetricTotalBooks',totalBooks.toLocaleString('en-IN'));set('adminMetricTotalBooksSub',`${catalog.length} catalog titles`);set('adminMetricAvailableBooks',available.toLocaleString('en-IN'));set('adminMetricAvailableBooksSub','Ready for loan');set('adminMetricMembers',members.length.toLocaleString('en-IN'));set('adminMetricMembersSub',`${members.filter(m=>!m.isDemo).length} real sign-up members`);set('adminMetricBorrowed',allLoans.length.toLocaleString('en-IN'));set('adminMetricBorrowedSub','Across member accounts');set('adminMetricOverdue',String(overdue));set('adminMetricOverdueSub',overdue?'Follow-up required':'No overdue items');set('adminMetricPending',String(pending));set('adminMetricPendingSub',pending?'Desk action needed':'Queue clear');set('adminMetricOrders',money(orderValue));set('adminMetricOrdersSub','Orders this month');set('adminMetricEvents','4');set('adminMetricEventsSub','Upcoming programmes');
    }
    function renderAdminDashboardLive(){renderAdminBorrowRequestsLive();renderAdminCatalogLive();renderAdminMembersLive();renderAdminOrdersLive();renderAdminMetricsLive();}
    window.renderAdminDashboardLive=renderAdminDashboardLive;

    window.handleAdminAddBook = event => {
        event.preventDefault();const form=event.currentTarget;if(!form.checkValidity()){form.classList.add('was-validated');return;}let catalog=getLiveCatalog();const title=document.getElementById('adminBookTitle')?.value.trim(),author=document.getElementById('adminBookAuthor')?.value.trim(),genre=document.getElementById('adminBookGenre')?.value||'Fiction',isbn=document.getElementById('adminBookIsbn')?.value.trim(),copies=Math.max(1,Number(document.getElementById('adminBookCopies')?.value||1)),price=Math.max(0,Number(document.getElementById('adminBookPrice')?.value||0)),summary=document.getElementById('adminBookSummary')?.value.trim()||'';const id=`custom-${Date.now()}`;catalog.unshift({id,title,author,genre,genreLabel:genre,isbn,copies,totalCopies:copies,priceVal:price,price:money(price),summary,description:summary,cover:'assets/images/books/book1.jpg',availability:'available',statusLabel:'Available',stock:`${copies} Copies Left`,rating:4.5,reviewsCount:0,pages:0,publisher:'StoryVault India',format:'Library Edition'});saveJSON(LIVE_KEYS.CATALOG,catalog);form.reset();form.classList.remove('was-validated');bootstrap.Modal.getInstance(document.getElementById('addBookModal'))?.hide();notifyLive('catalog-add');renderAdminDashboardLive();showToast('Book Added',`“${title}” added to the live StoryVault India catalog at ${money(price)}.`,'success');
    };

    // Book detail page: ensure live INR/stock + functional order button
    const detailTitle=document.getElementById('book-detail-title');
    if(detailTitle){const params=new URLSearchParams(location.search);let id=params.get('id')||'b1';const book=getLiveBook(id);if(book){const price=document.getElementById('book-detail-price');if(price)price.textContent=money(book.priceVal);const stock=document.getElementById('book-detail-stock-pill');if(stock)stock.textContent=book.copies>0?`${book.copies} Copies Available`:'On Reserve';const borrow=document.getElementById('book-detail-borrow-btn');if(borrow)borrow.onclick=()=>requestBorrow(book.id);const buy=document.getElementById('book-detail-buy-btn');if(buy)buy.onclick=()=>createBookOrder(book.id);}}

    // Static catalog price labels are updated from the same live catalog.
    getLiveCatalog().forEach(book=>{document.querySelectorAll(`.catalog-item-col[data-title="${CSS.escape(book.title)}"]`).forEach(card=>{card.dataset.price=String(book.priceVal);const p=card.querySelector('.book-price');if(p)p.textContent=money(book.priceVal);});});

    renderMemberDashboardLive(); renderAdminDashboardLive(); refreshWishlist();

    window.addEventListener('storage', event => {
        if([LIVE_KEYS.REQUESTS,LIVE_KEYS.BORROWED,LIVE_KEYS.HISTORY,LIVE_KEYS.ORDERS,LIVE_KEYS.REGISTERED,LIVE_KEYS.CATALOG].includes(event.key)){renderMemberDashboardLive();renderAdminDashboardLive();}
    });
    if(channel) channel.onmessage=()=>{renderMemberDashboardLive();renderAdminDashboardLive();};
});
