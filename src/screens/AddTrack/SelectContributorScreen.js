import React, { Component } from "react";
import { StyleSheet, View, Text, ImageBackground, Dimensions, Button, TouchableOpacity, Image, ScrollView, FlatList } from "react-native";
import FloatingLabel from "react-native-floating-labels";
import { CommonStyle, defaultGray } from "../_styles";
import UserAvatar from "react-native-user-avatar";
import SpotifyApi from "../../SpotifyAPI/SpotifyApi";

const navigationBack = require("../../../assets/images/back_icon.png");

class SelectContributorScreen extends React.Component {
	static navigationOptions = ({ navigation }) => {
		var clickBack = () => {};

		let params = navigation.state.params;

		if (params && params.clickBack) {
			clickBack = params.clickBack;
		}
		return {
			headerTitle: () => null,
			headerLeft: () => (
				<TouchableOpacity onPress={clickBack} style={CommonStyle.navigationBackContainer}>
					<Image source={navigationBack} style={CommonStyle.navigationBackIcon} resizeMode='contain' />
					<Text style={CommonStyle.navigationBackText}>Back</Text>
				</TouchableOpacity>
			),
			headerRight: null,
			headerStyle: CommonStyle.headerStyle,
		};
	};

	constructor(props) {
		super(props);

		this.state = {
			artistName: "",
			haveMusicLive: false,
			isProducer: true,
			isMixer: false,
			isTopLiner: false,
			artistList: [],
		};
	}

	componentDidMount() {
		this.props.navigation.setParams({
			clickBack: this.clickBackButton,
		});
	}

	clickItem = (selectedIndex) => {
		let { artistList } = this.state;

		let clonedArtistList = artistList.slice();

		clonedArtistList = clonedArtistList.map((item, index) => {
			item.selected = false;

			if (index == selectedIndex) {
				item.selected = true;
			}

			return item;
		});

		this.setState({ artistList: clonedArtistList });
	};

	clickBackButton = () => {
		let { artistList, isProducer, isMixer, isTopLiner, artistName, haveMusicLive } = this.state;

		let selectedArtistName = artistName;
		let selectedArtistID = "";
		let selectedAvatar = "";

		if (haveMusicLive) {
			if (artistList.length > 0) {
				for (let i = 0; i < artistList.length; i++) {
					if (artistList[i].selected == true) {
						selectedArtistName = artistList[i].name;
						selectedArtistID = artistList[i].id;
						selectedAvatar = artistList[i].avatar;
						break;
					}
				}
			}
		}

		if (selectedArtistName == "" && selectedArtistID == "") {
			this.props.navigation.goBack();

			return;
		}

		const data = {
			spotifyArtistId: selectedArtistID,
			artistName: selectedArtistName,
			avatar: selectedAvatar,
			isProducer: isProducer,
			isMixer: isMixer,
			isTopLiner: isTopLiner,
		};

		global.refreshEmitter.emit("ADD_CONTRIBUTORS", { data: data });

		this.props.navigation.goBack();
	};

	clickOption = (index) => {
		if (index == 0) {
			this.setState({ isProducer: true, isMixer: false, isTopLiner: false });
		} else if (index == 1) {
			this.setState({ isProducer: false, isMixer: true, isTopLiner: false });
		} else {
			this.setState({ isProducer: false, isMixer: false, isTopLiner: true });
		}
	};

	formatCash = (n) => {
		let result = "";
		if (n < 1e3) {
			result += n;
		}

		if (n >= 1e3 && n < 1e6) {
			result += +(n / 1e3).toFixed(1) + "K";
		}

		if (n >= 1e6 && n < 1e9) {
			result += +(n / 1e6).toFixed(1) + "M";
		}

		if (n >= 1e9 && n < 1e12) {
			result += +(n / 1e9).toFixed(1) + "B";
		}

		if (n >= 1e12) {
			result += +(n / 1e12).toFixed(1) + "T";
		}

		result = result.replace(".", ",");

		return result;
	};

	changeArtistName = (text) => {
		this.setState({ artistName: text }, () => {
			SpotifyApi.getSimilarArtist(text).then((artists) => {
				let artistList = [];
				if (Array.isArray(artists)) {
					for (let i = 0; i < artists.length; i++) {
						let artist = {};

						artist["name"] = artists[i].name;
						artist["selected"] = false;
						artist["id"] = artists[i].id;
						artist["followers"] = artists[i].followers.total;
						if (Array.isArray(artists[i].images) && artists[i].images.length > 0) {
							artist["avatar"] = artists[i].images[0].url;
						}

						artistList.push(artist);
					}

					this.setState({ artistList: artistList });
				}
			});
		});
	};

	render() {
		let { artistName, haveMusicLive, artistList, isProducer, isMixer, isTopLiner } = this.state;
		return (
			<View style={CommonStyle.container}>
				<ScrollView style={myStyles.scroll}>
					<View>
						<Text style={CommonStyle.commonTitle}>{"Contributors"}</Text>
					</View>

					<View style={CommonStyle.marginTop_5}>
						<Text style={CommonStyle.smallComment}>{"Add contributors who worked on this song."}</Text>
					</View>

					<View style={CommonStyle.marginTop_20}>
						<TouchableOpacity
							activeOpacity={0.95}
							style={[CommonStyle.full, CommonStyle.flexDirectionRow, CommonStyle.alignItemsCenter]}
							onPress={() => {
								this.clickOption(0);
							}}
						>
							<View style={CommonStyle.full}>
								<Text style={[CommonStyle.colorWhite, CommonStyle.fontSize_19]}>Producer</Text>
							</View>
							{isProducer && <View style={CommonStyle.checkedIcon}></View>}

							{!isProducer && <View style={CommonStyle.unCheckedIcon}></View>}
						</TouchableOpacity>
					</View>

					<View style={CommonStyle.marginTop_20}>
						<TouchableOpacity
							activeOpacity={0.95}
							style={[CommonStyle.full, CommonStyle.flexDirectionRow, CommonStyle.alignItemsCenter]}
							onPress={() => {
								this.clickOption(1);
							}}
						>
							<View style={CommonStyle.full}>
								<Text style={[CommonStyle.colorWhite, CommonStyle.fontSize_19]}>Mixer</Text>
							</View>
							{isMixer && <View style={CommonStyle.checkedIcon}></View>}

							{!isMixer && <View style={CommonStyle.unCheckedIcon}></View>}
						</TouchableOpacity>
					</View>

					<View style={CommonStyle.marginTop_20}>
						<TouchableOpacity
							activeOpacity={0.95}
							style={[CommonStyle.full, CommonStyle.flexDirectionRow, CommonStyle.alignItemsCenter]}
							onPress={() => {
								this.clickOption(2);
							}}
						>
							<View style={CommonStyle.full}>
								<Text style={[CommonStyle.fontSize_19, CommonStyle.colorWhite]}>Top Liner</Text>
							</View>
							{isTopLiner && <View style={CommonStyle.checkedIcon}></View>}

							{!isTopLiner && <View style={CommonStyle.unCheckedIcon}></View>}
						</TouchableOpacity>
					</View>

					<View style={CommonStyle.marginTop_25}>
						<FloatingLabel
							labelStyle={CommonStyle.labelInput}
							inputStyle={CommonStyle.input}
							style={CommonStyle.formInput}
							value={artistName}
							onChangeText={(text) => this.changeArtistName(text)}
						>
							Artist name
						</FloatingLabel>
						<Text style={[CommonStyle.fontSize_13, CommonStyle.colorDefaultGray]}>{"There is one artist on Spotify with a similar name."}</Text>
					</View>
					<View style={CommonStyle.marginTop_25}>
						<Text style={[CommonStyle.fontSize_14, CommonStyle.colorDefaultGray]}>{"Does this artist have music live on Spotify?"}</Text>

						<View style={[CommonStyle.full, CommonStyle.flexDirectionRow, CommonStyle.marginTop_20]}>
							<TouchableOpacity
								activeOpacity={0.95}
								onPress={() => {
									this.setState({ haveMusicLive: true });
								}}
								style={myStyles.checkBoxIconContainer}
							>
								{haveMusicLive && <View style={CommonStyle.checkedIcon}></View>}
								{!haveMusicLive && <View style={CommonStyle.unCheckedIcon}></View>}
								<Text style={CommonStyle.checkBoxText}>Yes</Text>
							</TouchableOpacity>
							<TouchableOpacity
								activeOpacity={0.95}
								onPress={() => {
									this.setState({ haveMusicLive: false });
								}}
								style={myStyles.checkBoxIconContainer}
							>
								{!haveMusicLive && <View style={CommonStyle.checkedIcon}></View>}
								{haveMusicLive && <View style={CommonStyle.unCheckedIcon}></View>}
								<Text style={CommonStyle.checkBoxText}>No</Text>
							</TouchableOpacity>
						</View>
						{haveMusicLive && (
							<View style={[CommonStyle.marginTop_20]}>
								<FlatList
									data={artistList}
									renderItem={({ item, index }) => (
										<TouchableOpacity
											activeOpacity={0.95}
											style={[CommonStyle.full, CommonStyle.flexDirectionRow, CommonStyle.alignItemsCenter, CommonStyle.marginTop_25]}
											onPress={() => {
												this.clickItem(index);
											}}
											key={index.toString()}
										>
											{item.avatar && <UserAvatar size={60} name={item.name} src={item.avatar} />}

											{!item.avatar && <UserAvatar size={60} name={item.name} />}

											<Image source={item.avatar} />
											<View style={[CommonStyle.full, CommonStyle.marginLeft_15]}>
												<Text style={[CommonStyle.defaultFontSize, CommonStyle.colorWhite]}>{item.name}</Text>
												<Text style={[CommonStyle.marginTop_10, CommonStyle.fontSize_13, CommonStyle.colorDefaultGray]}>
													{this.formatCash(item.followers)} {"followers"}
												</Text>
											</View>
											{item.selected && <View style={CommonStyle.checkedIcon}></View>}

											{!item.selected && <View style={CommonStyle.unCheckedIcon}></View>}
										</TouchableOpacity>
									)}
									keyExtractor={(item) => item.id}
								/>
								<View style={{ height: 50 }}></View>
							</View>
						)}
					</View>
				</ScrollView>
			</View>
		);
	}
}

export const myStyles = StyleSheet.create({
	scroll: {
		flex: 1,
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 15,
		paddingBottom: 15,
	},
	checkBoxIconContainer: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		flexDirection: "row",
	},
});

export default SelectContributorScreen;
