(function($){

    var bip39 = new BIP39('en');
    var isJP = false;
    var bip32_source_key = null;
    var bip32_derivation_path = null;
    var gen_from = "pass";
    var hash_worker = null;
    var hash_worker_working = false;
    var bip32_passphrase_hash = null;

    var TIMEOUT = 600;
    var timeout = null;

    var coin = "btc_main";

    var COINS = {
        btc_main: {
            name: "Bitcoin",
            network: "Mainnet",
            prefix: 0,
            private_prefix: 0+0x80,
            bip32_public: BITCOIN_MAINNET_PUBLIC,
            bip32_private: BITCOIN_MAINNET_PRIVATE
        },
        btc_test: {
            name: "Bitcoin",
            network: "Testnet",
            prefix: 0x6f,
            private_prefix: 0x6f+0x80,
            bip32_public: BITCOIN_TESTNET_PUBLIC,
            bip32_private: BITCOIN_TESTNET_PRIVATE
        },
        doge_main: {
            name: "Dogecoin",
            network: "Mainnet",
            prefix: 0x1e,
            private_prefix: 0x1e+0x80,
            bip32_public: DOGECOIN_MAINNET_PUBLIC,
            bip32_private: DOGECOIN_MAINNET_PRIVATE
        },
        doge_test: {
            name: "Dogecoin",
            network: "Testnet",
            prefix: 0x71,
            private_prefix: 0x71+0x80,
            bip32_public: DOGECOIN_TESTNET_PUBLIC,
            bip32_private: DOGECOIN_TESTNET_PRIVATE
        },
        ltc_main: {
            name: "Litecoin",
            network: "Mainnet",
            prefix: 0x30,
            private_prefix: 0x30+0x80,
            bip32_public: LITECOIN_MAINNET_PUBLIC,
            bip32_private: LITECOIN_MAINNET_PRIVATE
        },
        ltc_test: {
            name: "Litecoin",
            network: "Testnet",
            prefix: 0x6f,
            private_prefix: 0x6f+0x80,
            bip32_public: LITECOIN_TESTNET_PUBLIC,
            bip32_private: LITECOIN_TESTNET_PRIVATE
        },
        mona_main: {
            name: "Monacoin",
            network: "Mainnet",
            prefix: 0x32,
            private_prefix: 0x32+0x80,
            bip32_public: MONACOIN_MAINNET_PUBLIC,
            bip32_private: MONACOIN_MAINNET_PRIVATE
        },
        mona_test: {
            name: "Monacoin",
            network: "Testnet",
            prefix: 0x6f,
            private_prefix: 0x6f+0x80,
            bip32_public: MONACOIN_TESTNET_PUBLIC,
            bip32_private: MONACOIN_TESTNET_PRIVATE
        },
        kuma_main: {
            name: "Kumacoin",
            network: "Mainnet",
            prefix: 0x2d,
            private_prefix: 0x2d+0x80,
            bip32_public: KUMACOIN_MAINNET_PUBLIC,
            bip32_private: KUMACOIN_MAINNET_PRIVATE
        },
        kuma_test: {
            name: "Kumacoin",
            network: "Testnet",
            prefix: 0x75,
            private_prefix: 0x75+0x80,
            bip32_public: KUMACOIN_TESTNET_PUBLIC,
            bip32_private: KUMACOIN_TESTNET_PRIVATE
        }
    };

    entropy_array = ["00000000000000000000000000000000",
                     "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
                     "80808080808080808080808080808080",
                     "ffffffffffffffffffffffffffffffff",
                     "000000000000000000000000000000000000000000000000",
                     "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
                     "808080808080808080808080808080808080808080808080",
                     "ffffffffffffffffffffffffffffffffffffffffffffffff",
                     "0000000000000000000000000000000000000000000000000000000000000000",
                     "7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f",
                     "8080808080808080808080808080808080808080808080808080808080808080",
                     "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                     "77c2b00716cec7213839159e404db50d",
                     "b63a9c59a6e641f288ebc103017f1da9f8290b3da6bdef7b",
                     "3e141609b97933b66a060dcddc71fad1d91677db872031e85f4c015c5e7e8982",
                     "0460ef47585604c5660618db2e6a7e7f",
                     "72f60ebac5dd8add8d2a25a797102c3ce21bc029c200076f",
                     "2c85efc7f24ee4573d2b81a6ec66cee209b2dcbd09d8eddc51e0215b0b68e416",
                     "eaebabb2383351fd31d703840b32e9e2",
                     "7ac45cfe7722ee6c7ba84fbc2d5bd61b45cb2fe5eb65aa78",
                     "4fa1a8bc3e6d80ee1316050e862c1812031493212b7ec3f3bb1b08f168cabeef",
                     "18ab19a9f54a9274f03e5209a2ac8a91",
                     "18a2e1d81b8ecfb2a333adcb0c17a5b9eb76cc5d05db91a4",
                     "15da872c95a13dd738fbf50e427583ad61f18fd99f628c417a61cf8343c90419"]

    var PUBLIC_KEY_VERSION = 0;
    var PRIVATE_KEY_VERSION = 0x80;
    var ADDRESS_URL_PREFIX = ''
    var BIP32_TYPE = BITCOIN_MAINNET_PRIVATE;

    function pad(str, len, ch) {
        padding = '';
        for (var i = 0; i < len - str.length; i++) {
            padding += ch;
        }
        return padding + str;
    }

    function setWarningState(field, err, msg) {
        var group = field.closest('.form-group');
        if (err) {
            group.removeClass('has-error').addClass('has-warning');
            group.attr('title', msg);
        } else {
            group.removeClass('has-warning').removeClass('has-error');
            group.attr('title', '');
        }
    }

    function setErrorState(field, err, msg) {
        var group = field.closest('.form-group');
        if (err) {
            group.removeClass('has-warning').addClass('has-error');
            group.attr('title',msg);
        } else {
            group.removeClass('has-warning').removeClass('has-error');
            group.attr('title','');
        }
    }

    function pad2(s) {
        if(s.length == 1) return '0' + s;
        return s;
    }

    function pad8(s) {
        while(s.length < 8) s = '0' + s;
        return s;
    }

    function byteArrayToHexString(a) {
        var s = '';
        for( var i in a ) {
            s = s + pad2(a[i].toString(16));
        }
        return s;
    }

    // --- bip32 ---

    function onUpdateGenFrom() {
        gen_from = $(this).attr('id').substring(5);
        updateGenFrom();
    }

    function updateGenFrom() {
        if( gen_from == 'pass' ) {
            $("#bip32_source_passphrase").attr('readonly', false);
            $("#bip39_passphrase").attr('readonly', false);
            $("#bip32_source_key").attr('readonly', false);
            $("#cancel_hash_worker").attr('disabled', false);
            $("#gen_from_msg").html("Enter a Phrase to generate a BIP32 Wallet.");
        } else {
            setErrorState($("#bip32_source_passphrase"), false);
            $("#bip32_source_passphrase").attr('readonly', true);
            $("#bip39_passphrase").attr('readonly', true);
            $("#bip32_source_key").attr('readonly', false);
            stop_hash_worker();
            $("#cancel_hash_worker").attr('disabled', true);
            $("#gen_from_msg").html("Enter a Master Private / Public Key to Generate a BIP32 Wallet.");
        }
    }

    function onUpdateSourcePassphrase() {
        clearTimeout(timeout);
        timeout = setTimeout(updateSourcePassphrase, TIMEOUT);
        setWarningState($("#bip32_source_passphrase"), false);
    }

    function onLanguageChanged() {
        if($(this).is(":checked")) {
            bip39 = new BIP39('en');
            isJP = false;
            onCancelHashWorkerClicked();
        } else {
            bip39 = new BIP39('jp');
            isJP = true;
            onCancelHashWorkerClicked();
        }
    }

    function createTestVectors() {
        var seed
        var salt
        var hexseed
        var xprv
        
        console.log( "[" );
        console.log( "{" );
        for (var i = 0; i < entropy_array.length; i++) {
            seed = bip39.entropyToMnemonic(entropy_array[i])
            salt = "㍍ガバヴァぱばぐゞちぢ十人十色"
            console.log( "   \"entropy\": \"" + entropy_array[i] + "\"," );
            console.log( "    \"phrase\": \"" + seed + "\"," );
            console.log( "      \"salt\": \"" + salt + "\",");
            seed = seed.normalize('NFKD');
            salt = salt.normalize('NFKD');
            hexseed = bip39.mnemonicToSeed(seed, salt);
            console.log( "      \"seed\": \"" + hexseed + "\",");
            
            var hasher = new jsSHA(hexseed, 'HEX');   
            var I = hasher.getHMAC("Bitcoin seed", "TEXT", "SHA-512", "HEX");
            var il = Crypto.util.hexToBytes(I.slice(0, 64));
            var ir = Crypto.util.hexToBytes(I.slice(64, 128));

            var gen_bip32 = new BIP32();
            try {
                gen_bip32.eckey = new Bitcoin.ECKey(il);
                gen_bip32.eckey.pub = gen_bip32.eckey.getPubPoint();
                gen_bip32.eckey.setCompressed(true);
                gen_bip32.eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(gen_bip32.eckey.pub.getEncoded(true));
                gen_bip32.has_private_key = true;

                gen_bip32.chain_code = ir;
                gen_bip32.child_index = 0;
                gen_bip32.parent_fingerprint = Bitcoin.Util.hexToBytes("00000000");
                gen_bip32.version = COINS[coin].bip32_private;
                gen_bip32.depth = 0;

                gen_bip32.build_extended_public_key();
                gen_bip32.build_extended_private_key();
            } catch (err) {
                return;
            }

            xprv = gen_bip32.extended_private_key_string("base58")
            console.log( "\"bip32_xprv\": \"" + xprv + "\"");
            if (i != entropy_array.length - 1) {
                console.log( "}," );
                console.log( "" );
                console.log( "{" );
            } else {
                console.log( "}" );
                console.log( "]" );
            }
        }
    };

    function onCancelHashWorkerClicked() {
        //stop_hash_worker();

        if($("#ent_input").val()!=""){
            try{
                var seed = UseEntropy();
            } catch(err) {
                $("#bip32_source_passphrase").val("");
                return;
            }
        } else {
            var seed = bip39.generateMnemonic(($("input[name='wordcnt']:checked").val()/3)*32);
        }
        var seed_pw = $("#bip39_passphrase").val();
        seed_pw = seed_pw.normalize("NFKD");
        $("#bip32_source_passphrase").val(seed);
        seed = seed.normalize("NFKD");
        //var passphrase = $("#bip32_source_passphrase").val();
        //bip32_passphrase_hash = Crypto.util.bytesToHex(Crypto.SHA256(passphrase, { asBytes: true }));
        
        bip32_passphrase_hash = bip39.mnemonicToSeed(seed, seed_pw);
        updatePassphraseHash();

        //setWarningState($("#bip32_source_passphrase"), true, "The passphrase was hashed using a single SHA-256 and should be considered WEAK and INSECURE");
    }

    function UseEntropy() {
        var dice_rolls = $("#ent_input").val();
        var base = $("input[name='base']:checked").val();
        var words = $("input[name='wordcnt']:checked").val();
        
        if(base==6&&words==12&& !/^[0-5]{53}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 53 digits of 0-5");raise;};
        if(base==6&&words==24&& !/^[0-5]{99}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 99 digits of 0-5");raise;};
        if(base==20&&words==12&& !/^[A-Ja-j0-9]{31}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 31 digits of 0-9, A-J");raise;};
        if(base==20&&words==24&& !/^[A-Ja-j0-9]{60}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 60 digits of 0-9, A-J");raise;};
        if(base==16&&words==12&& !/^[A-Fa-f0-9]{32}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 32 digits of 0-9, A-F");raise;};
        if(base==16&&words==24&& !/^[A-Fa-f0-9]{64}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 64 digits of 0-9, A-F");raise;};
        if(base==2&&words==12&& !/^[0-1]{128}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 128 digits of 0-1");raise;};
        if(base==2&&words==24&& !/^[0-1]{256}$/.test(dice_rolls) ){alert("Entropy incorrect\nPlease use 256 digits of 0-1");raise;};
        
        if(base!=16){
            var bit128 = new BigInteger("100000000000000000000000000000000", 16);
            var bit256 = new BigInteger("10000000000000000000000000000000000000000000000000000000000000000", 16);
            
            if(words==12){
                var entropy = new BigInteger(dice_rolls, base).mod(bit128);
            } else {
                var entropy = new BigInteger(dice_rolls, base).mod(bit256);
            }
            
            entropy = Crypto.util.bytesToHex(entropy.toByteArrayUnsigned());
            
        } else {
            var entropy = dice_rolls
        }
        
        var pad128 = "00000000000000000000000000000000"
        var pad256 = "0000000000000000000000000000000000000000000000000000000000000000"
        
        if(words==12){
            entropy = pad128.substring(0, pad128.length - entropy.length) + entropy
        } else {
            entropy = pad256.substring(0, pad256.length - entropy.length) + entropy
        }
        
        return bip39.entropyToMnemonic(entropy);
    }

    function updateSourcePassphrase() {
        var passphrase = $("#bip32_source_passphrase").val();
        var seed_pw = $("#bip39_passphrase").val();
        passphrase = passphrase.normalize("NFKD");
        seed_pw = seed_pw.normalize("NFKD");
        if(isJP){
            passphrase = passphrase.replace(' ', '　');
        }
        if(!bip39.validate(passphrase)&&passphrase!=''){
        
        alert( "Incorrect BIP39 Phrase" );
        
        } else if(passphrase!='') {
        
        passphrase = passphrase.normalize("NFKD");
        bip32_passphrase_hash = bip39.mnemonicToSeed(passphrase, seed_pw);
        updatePassphraseHash();
        
        }
    }

    function updatePassphraseHash() {
        var hasher = new jsSHA(bip32_passphrase_hash, 'HEX');   
        var I = hasher.getHMAC("Bitcoin seed", "TEXT", "SHA-512", "HEX");
        var il = Crypto.util.hexToBytes(I.slice(0, 64));
        var ir = Crypto.util.hexToBytes(I.slice(64, 128));

        var gen_bip32 = new BIP32();
        try {
            gen_bip32.eckey = new Bitcoin.ECKey(il);
            gen_bip32.eckey.pub = gen_bip32.eckey.getPubPoint();
            gen_bip32.eckey.setCompressed(true);
            gen_bip32.eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(gen_bip32.eckey.pub.getEncoded(true));
            gen_bip32.has_private_key = true;

            gen_bip32.chain_code = ir;
            gen_bip32.child_index = 0;
            gen_bip32.parent_fingerprint = Bitcoin.Util.hexToBytes("00000000");
            gen_bip32.version = COINS[coin].bip32_private;
            gen_bip32.depth = 0;

            gen_bip32.build_extended_public_key();
            gen_bip32.build_extended_private_key();
        } catch (err) {
            setErrorState($('#bip32_source_passphrase'), true, '' + err);
            return;
        }

        setErrorState($('#bip32_source_passphrase'), false);

        $("#bip32_source_key").val(gen_bip32.extended_private_key_string("base58"));
        updateSourceKey();
    }

    function isMasterKey(k) {
        return k.child_index == 0 && k.depth == 0 && 
               ( k.parent_fingerprint[0] == 0 && k.parent_fingerprint[1] == 0 && k.parent_fingerprint[2] == 0 && k.parent_fingerprint[3] == 0 );
    }

    function onUpdateSourceKey() {
        clearTimeout(timeout);
        timeout = setTimeout(updateSourceKey, TIMEOUT);
    }

    function updateSourceKey() {
        $("#bip32_key_info_title").html('');
        $("#bip32_key_info_version").val('');
        $("#bip32_key_info_depth").val('');
        $("#bip32_key_info_parent_fingerprint").val('');
        $("#bip32_key_info_child_index").val('');
        $("#bip32_key_info_chain_code").val('');
        $("#bip32_key_info_key").val('');

        setErrorState($('#bip32_source_key'), false);

        try {
            var source_key_str = $("#bip32_source_key").val();
            if(source_key_str.length == 0) return;
            bip32_source_key = new BIP32(source_key_str);
        } catch(err) {
            bip32_source_key = null;
            setErrorState($('#bip32_source_key'), true, 'Invalid key: ' + err.toString());
            return;
        }

        //console.log(bip32_source_key);
        updateSourceKeyInfo();
        updateDerivationPath();
    }

    function getCoinFromKey(k) {
        for(var coin_name in COINS) {
            var c = COINS[coin_name];
            if(k.version == c.bip32_public || k.version == c.bip32_private) {
                return c;
            }
        }

        return null;
    }

    function updateSourceKeyInfo() {
        var key_coin = getCoinFromKey(bip32_source_key);

        if( isMasterKey(bip32_source_key) ) {
            if( bip32_source_key.has_private_key ) {
                $("#bip32_key_info_title").html("<b>" + key_coin.name + " Master Private Key</b>");
            } else {
                $("#bip32_key_info_title").html("<b>" + key_coin.name + " Master Public Key</b>");
            }
        } else {
            if( bip32_source_key.has_private_key ) {
                $("#bip32_key_info_title").html("<b>" + key_coin.name + " Derived Private Key</b>");
            } else {
                $("#bip32_key_info_title").html("<b>" + key_coin.name + " Derived Public Key</b>");
            }
        }

        var v = '' + pad8(bip32_source_key.version.toString(16));
        if( bip32_source_key.has_private_key ) v = v + " (" + key_coin.name + " " + key_coin.network + " private key)";
        else                                   v = v + " (" + key_coin.name + " " + key_coin.network + " public key)";

        $("#bip32_key_info_version").val(v);

        $("#bip32_key_info_depth").val('' + bip32_source_key.depth);

        $("#bip32_key_info_parent_fingerprint").val('' + pad2(bip32_source_key.parent_fingerprint[0].toString(16)) +
                                                         pad2(bip32_source_key.parent_fingerprint[1].toString(16)) +
                                                         pad2(bip32_source_key.parent_fingerprint[2].toString(16)) +
                                                         pad2(bip32_source_key.parent_fingerprint[3].toString(16)));

        $("#bip32_key_info_child_index").val(bip32_source_key.child_index);
        $("#bip32_key_info_chain_code").val('' + byteArrayToHexString(bip32_source_key.chain_code));

        if( bip32_source_key.has_private_key ) {
            $("#bip32_key_info_key").val(Crypto.util.bytesToHex(bip32_source_key.eckey.priv.toByteArrayUnsigned()));
        } else {
            var bytes = Crypto.util.bytesToHex(bip32_source_key.eckey.pub.getEncoded(true));
            $("#bip32_key_info_key").val(bytes);
        }

        return;
    }

    function onUpdateDerivationPath() {
        updateDerivationPath();
    }

    function onUpdateCustomPath() {
        clearTimeout(timeout);
        timeout = setTimeout(updateDerivationPath, TIMEOUT);
    }

    function onAccountIndexChanged() {
        clearTimeout(timeout);
        timeout = setTimeout(updateDerivationPath, TIMEOUT);
    }

    function onKeypairIndexChanged() {
        clearTimeout(timeout);
        timeout = setTimeout(updateDerivationPath, TIMEOUT);
    }

    function updateDerivationPath() {
        bip32_derivation_path = $("#bip32_derivation_path :selected").val();

        if( bip32_derivation_path == "custom" ) {
            $("#custom_group").show();
            bip32_derivation_path = $("#bip32_custom_path").val();
        } else {
            $("#custom_group").hide();
        }

        if( bip32_derivation_path.indexOf('/k/') >= 0 || bip32_derivation_path.indexOf('/k\'/') >= 0 ) {
            $("#account_group").show();
        } else {
            $("#account_group").hide();
        }

        if( bip32_derivation_path.indexOf('/i/') >= 0 || 
            bip32_derivation_path.indexOf('/i\'/') >= 0 || 
            bip32_derivation_path.slice(bip32_derivation_path.length-2) == "/i" ||
            bip32_derivation_path.slice(bip32_derivation_path.length-3) == "/i'" ) {
            $("#child_group").show();
        } else {
            $("#child_group").hide();
        }

        updateResult();
    }

    function updateResult() {
        var p = '' + bip32_derivation_path;
        var k = parseInt($("#account_index").val());
        var i = parseInt($("#keypair_index").val());

        p = p.replace('i', i).replace('k', k);

        setErrorState($('#bip32_derivation_path'), false);
        $("#derived_private_key").val('');
        $("#derived_public_key").val('');
        $("#derived_private_key_wif").val('');
        $("#derived_public_key_hex").val('');
        $("#addr").val('');
        $("#genAddrQR").val('');

        try {
            if(bip32_source_key == null) {
                // if this is the case then theres an error state set on the source key
                return;
            }
            console.log("Deriving: " + p);
            var result = bip32_source_key.derive(p);
        } catch (err) {
            setErrorState($('#bip32_derivation_path'), true, 'Error deriving key: ' + err.toString());
            return;
        }

        var key_coin = getCoinFromKey(result);

        if( result.has_private_key ) {
            $("#derived_private_key").val(result.extended_private_key_string("base58"));

            var privkeyBytes = result.eckey.priv.toByteArrayUnsigned();
            while (privkeyBytes.length < 32) {
                privkeyBytes.unshift(0)
            };
            var bytes = [key_coin.private_prefix].concat(privkeyBytes).concat([1]);
            var checksum = Crypto.SHA256(Crypto.SHA256(bytes, {asBytes: true}), {asBytes: true}).slice(0, 4);
            $("#derived_private_key_wif").val(Bitcoin.Base58.encode(bytes.concat(checksum)))
        } else {
            $("#derived_private_key").val("No private key available");
            $("#derived_private_key_wif").val("No private key available");
        }

        $("#derived_public_key").val(result.extended_public_key_string("base58"));
        $("#derived_public_key_hex").val(Crypto.util.bytesToHex(result.eckey.pub.getEncoded(true)));
 
        var hash160 = result.eckey.pubKeyHash;
        var addr = new Bitcoin.Address(hash160);
        addr.version = key_coin.prefix;
        $("#addr").val(addr.toString());

        var qrCode = qrcode(3, 'M');
        var text = $('#addr').val();
        text = text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
        qrCode.addData(text);
        qrCode.make();

        $('#genAddrQR').html(qrCode.createImgTag(4));
        $('#genAddrURL').attr('href', ADDRESS_URL_PREFIX+text);
        $('#genAddrURL').attr('title', text);
    }

    function onInput(id, func) {
        $(id).bind("input keyup keydown keypress change blur", function() {
            if ($(this).val() != jQuery.data(this, "lastvalue")) {
                func();
            }
            jQuery.data(this, "lastvalue", $(this).val());
        });
        $(id).bind("focus", function() {
           jQuery.data(this, "lastvalue", $(this).val());
        });
    }

    function crChange(e)
    {
        var key_coin = getCoinFromKey(bip32_source_key);

        e.preventDefault();
        coin = $(this).attr("id");
        ADDRESS_URL_PREFIX = $(this).attr('href');
        $('#crName').text($(this).text());
        $('#crSelect').dropdown('toggle');

        if( gen_from == 'pass' && bip32_source_key === null ) {
            updateSourcePassphrase();
        } else if( bip32_source_key !== null ) {
            if( COINS[coin].prefix != key_coin.prefix ) { // key is changing to another realm..
                var is_private = (bip32_source_key.version == key_coin.bip32_private);
                var is_public = (bip32_source_key.version == key_coin.bip32_public);

                if( is_public ) {
                    bip32_source_key.version = COINS[coin].bip32_public;
                    bip32_source_key.build_extended_public_key();
                    $("#bip32_source_key").val(bip32_source_key.extended_public_key_string("base58"));
                } else if( is_private ) {
                    bip32_source_key.version = COINS[coin].bip32_private;
                    bip32_source_key.build_extended_public_key();
                    bip32_source_key.build_extended_private_key();
                    $("#bip32_source_key").val(bip32_source_key.extended_private_key_string("base58"));
                }
            }

            updateSourceKey();
        }

        return false;
    }

    // -- web worker for hashing passphrase --
    function hash_worker_message(e) {
        // ignore the hash worker
        if(!hash_worker_working) return;

        var m = e.data;
        switch(m.cmd) {
        case 'progress':
            $("#bip32_hashing_progress_bar").width('' + m.progress + "%");
            break;
        case 'done':
            $("#bip32_hashing_progress_bar").width('100%');
            $("#bip32_hashing_style").removeClass("active");
            $("#cancel_hash_worker").attr('disabled', false);
            hash_worker_working = false;
            bip32_passphrase_hash = m.result;
            updatePassphraseHash();
            break;
        }
        console.log(m);
    }

    function start_hash_worker(passphrase) {
        if( hash_worker === null ) {
            hash_worker = new Worker("js/hash_worker.js");
            hash_worker.addEventListener('message', hash_worker_message, false);
        }

        bip32_passphrase_hash = null;
        bip32_source_key = null;

        $("#bip32_source_key").val('');
        updateSourceKey();
        updateResult();

        $("#bip32_hashing_progress_bar").css('width', '0%');
        $("#bip32_hashing_style").addClass("active");

        hash_worker_working = true;
        $("#cancel_hash_worker").attr('disabled', false);
        hash_worker.postMessage({"cmd": "start", "bip32_source_passphrase": passphrase});
    }
    
    function stop_hash_worker() {
        $("#cancel_hash_worker").attr('disabled', false);
        hash_worker_working = false;
        $("#bip32_hashing_progress_bar").css("width", "0%");
        if( hash_worker != null ) {
            hash_worker.postMessage({"cmd": "stop"});
        }
    }

    function update_length() {
        $("#ent_cnt").html("Length: " + $("#ent_input").val().length);
    }

    $(document).ready( function() {

        if (window.location.hash)
          $('#tab-' + window.location.hash.substr(1).split('?')[0]).tab('show');

        $('a[data-toggle="tab"]').on('click', function (e) {
            window.location.hash = $(this).attr('href');
        });

        // bip32

        $('#gen_from label input').on('change', onUpdateGenFrom );
        updateGenFrom();

        $("#bip32_source_passphrase").val("awake book subject inch gentle blur grant damage process float month clown");
        $("#bip32_source_key").val("xprv9s21ZrQH143K4KqQx9Zrf1eN8EaPQVFxM2Ast8mdHn7GKiDWzNEyNdduJhWXToy8MpkGcKjxeFWd8oBSvsz4PCYamxR7TX49pSpp3bmHVAY");
        onInput("#bip32_source_passphrase", onUpdateSourcePassphrase);
        onInput("#bip39_passphrase", onUpdateSourcePassphrase);
        
        onInput("#ent_input", update_length);

        $("#checkbox_change_language").on('change', onLanguageChanged );

        $("#cancel_hash_worker").on('click', onCancelHashWorkerClicked); // createTestVectors to generate vectors in console
        onInput("#bip32_source_key", onUpdateSourceKey);
        $("#bip32_hashing_progress_bar").width('100%');
        $("#cancel_hash_worker").attr('disabled', false);
        updateSourceKey();

        $('#bip32_derivation_path').on('change', onUpdateDerivationPath);
        onInput("#bip32_custom_path", onUpdateCustomPath);
        onInput("#account_index", onAccountIndexChanged);
        onInput("#keypair_index", onKeypairIndexChanged);

        updateDerivationPath();

        // currency select

        $('#crCurrency ul li a').on('click', crChange);

    });
})(jQuery);
